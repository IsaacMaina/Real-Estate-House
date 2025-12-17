// src/lib/image-sync.ts
import { uploadImage, deleteImage } from './storage';
import { getDbPool } from './db';

/**
 * Upload image to Supabase and save record to database
 */
export const uploadAndSaveImage = async (
  file: File,
  propertyId: string,
  altText: string = '',
  imageType: string = 'property',
  imageOrder: number = 0
) => {
  try {
    // Upload image to Supabase
    const imageUrl = await uploadImage(file, 'property-images', 'property-images');
    if (!imageUrl) {
      throw new Error('Failed to upload image to storage');
    }

    // Save image record to database
    const pool = getDbPool();
    const result = await pool.query(
      `INSERT INTO images (property_id, url, alt_text, image_order, image_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, url`,
      [propertyId, imageUrl, altText, imageOrder, imageType]
    );

    await pool.end();
    return result.rows[0];
  } catch (error) {
    console.error('Error uploading and saving image:', error);
    return null;
  }
};

/**
 * Delete image from both Supabase and database
 */
export const deleteImageAndRecord = async (imageId: string, imageUrl: string) => {
  try {
    // Delete from database first
    const pool = getDbPool();
    await pool.query('DELETE FROM images WHERE id = $1', [imageId]);

    // Then delete from Supabase storage
    const deleted = await deleteImage(imageUrl);

    await pool.end();
    return deleted;
  } catch (error) {
    console.error('Error deleting image and record:', error);
    return false;
  }
};

/**
 * Update image record in database (without changing the image file)
 */
export const updateImageRecord = async (
  imageId: string,
  altText?: string,
  imageOrder?: number,
  imageType?: string
) => {
  try {
    const pool = getDbPool();
    
    // Build dynamic query based on what fields are being updated
    const updates = [];
    const values = [imageId]; // imageId will always be the last parameter
    let paramIndex = 2; // Start from $2 since $1 is imageId

    if (altText !== undefined) {
      updates.push(`alt_text = $${paramIndex}`);
      values.push(altText);
      paramIndex++;
    }

    if (imageOrder !== undefined) {
      updates.push(`image_order = $${paramIndex}`);
      values.push(imageOrder);
      paramIndex++;
    }

    if (imageType !== undefined) {
      updates.push(`image_type = $${paramIndex}`);
      values.push(imageType);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `UPDATE images SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $1`;
    const result = await pool.query(query, values);

    await pool.end();
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error updating image record:', error);
    return false;
  }
};

/**
 * Upload and save content image (for pages, hero, etc.)
 */
// Helper function to get page ID by slug
const getPageIdBySlug = async (slug: string): Promise<string | null> => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      'SELECT id FROM pages WHERE slug = $1',
      [slug]
    );

    await pool.end();
    return result.rows[0]?.id || null;
  } catch (error) {
    console.error('Error getting page ID by slug:', error);
    return null;
  }
};

export const uploadAndSaveContentImage = async (
  file: File,
  pageId: string | null,
  sectionName: string,
  imageType: string = 'general',
  altText: string = ''
) => {
  try {
    // Upload image to Supabase
    const imageUrl = await uploadHeroImage(file, 'hero');
    if (!imageUrl) {
      throw new Error('Failed to upload hero image to storage');
    }

    // Save image record to database
    const pool = getDbPool();

    let result;
    if (pageId) {
      result = await pool.query(
        `INSERT INTO content_images (page_id, section_name, url, alt_text, image_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, url`,
        [pageId, sectionName, imageUrl, altText, imageType]
      );
    } else {
      result = await pool.query(
        `INSERT INTO content_images (section_name, url, alt_text, image_type)
         VALUES ($1, $2, $3, $4)
         RETURNING id, url`,
        [sectionName, imageUrl, altText, imageType]
      );
    }

    await pool.end();
    return result.rows[0];
  } catch (error) {
    console.error('Error uploading and saving content image:', error);
    return null;
  }
};

// New function that accepts a slug instead of an ID
export const uploadAndSaveContentImageBySlug = async (
  file: File,
  pageSlug: string | null,
  sectionName: string,
  imageType: string = 'general',
  altText: string = ''
) => {
  try {
    // If a page slug is provided, get the page ID
    let pageId: string | null = null;
    if (pageSlug) {
      pageId = await getPageIdBySlug(pageSlug);
      if (!pageId) {
        console.error(`Page with slug '${pageSlug}' not found`);
        return null;
      }
    }

    // Use the original function with the page ID
    return await uploadAndSaveContentImage(file, pageId, sectionName, imageType, altText);
  } catch (error) {
    console.error('Error uploading and saving content image by slug:', error);
    return null;
  }
};

/**
 * Delete content image from both Supabase and database
 */
export const deleteContentImageAndRecord = async (imageId: string, imageUrl: string) => {
  try {
    // Delete from database first
    const pool = getDbPool();
    await pool.query('DELETE FROM content_images WHERE id = $1', [imageId]);

    // Then delete from Supabase storage
    const deleted = await deleteImage(imageUrl);

    await pool.end();
    return deleted;
  } catch (error) {
    console.error('Error deleting content image and record:', error);
    return false;
  }
};

/**
 * Update hero content in database
 */
export const updateHeroContent = async (
  pageSlug: string,
  heroTitle: string,
  heroSubtitle: string,
  heroDescription: string
) => {
  try {
    const pool = getDbPool();

    const query = `UPDATE pages SET
      hero_title = $1,
      hero_subtitle = $2,
      hero_description = $3,
      updated_at = NOW()
      WHERE slug = $4`;
    const values = [heroTitle, heroSubtitle, heroDescription, pageSlug];

    const result = await pool.query(query, values);

    await pool.end();
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error updating hero content:', error);
    return false;
  }
};