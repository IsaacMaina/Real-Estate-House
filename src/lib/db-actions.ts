// src/lib/db-actions.ts
import { getDbPool } from "./db";
import bcrypt from "bcryptjs";

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Get all properties from the database
 */
export const getAllProperties = async (filters: Record<string, any> = {}) => {
  try {
    const pool = getDbPool();

    // Build the query dynamically based on provided filters
    let query = `
      SELECT
        p.id,
        p.title,
        p.description,
        p.price,
        p.location,
        p.property_type,
        p.bedrooms as beds,
        p.bathrooms as baths,
        p.sqft,
        p.parking_spaces as parking,
        CASE
          WHEN p.property_type ~ '^[0-9]+[a-zA-Z_]' THEN
            REGEXP_REPLACE(p.property_type, '^[0-9]+', '')
          ELSE p.property_type
        END as propertyType,
        p.status,
        p.featured,
        p.details,
        p.created_at as createdAt,
        p.amenities,
        p.features,
        p.nearby_landmarks
      FROM properties p
      WHERE TRUE
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Apply filters based on provided parameters
    if (filters.location) {
      query += ` AND (LOWER(p.location) LIKE LOWER($${paramIndex}) OR LOWER(p.title) LIKE LOWER($${paramIndex}))`;
      params.push(`%${filters.location}%`);
      paramIndex++;
    }

    if (filters.propertyType) {
      query += ` AND p.property_type = $${paramIndex}`;
      params.push(filters.propertyType);
      paramIndex++;
    }

    if (filters.minPrice) {
      query += ` AND p.price >= $${paramIndex}`;
      params.push(parseInt(filters.minPrice));
      paramIndex++;
    }

    if (filters.maxPrice) {
      query += ` AND p.price <= $${paramIndex}`;
      params.push(parseInt(filters.maxPrice));
      paramIndex++;
    }

    if (filters.beds) {
      query += ` AND p.bedrooms >= $${paramIndex}`;
      params.push(parseInt(filters.beds));
      paramIndex++;
    }

    if (filters.baths) {
      query += ` AND p.bathrooms >= $${paramIndex}`;
      params.push(parseInt(filters.baths));
      paramIndex++;
    }

    if (filters.parking) {
      query += ` AND p.parking_spaces >= $${paramIndex}`;
      params.push(parseInt(filters.parking));
      paramIndex++;
    }

    query += ` ORDER BY p.created_at DESC`;

    const propertiesResult = await pool.query(query, params);

    const properties = propertiesResult.rows;

    // Get all property images
    if (properties.length > 0) {
      const propertyIds = properties.map((prop) => prop.id);

      const imagesResult = await pool.query(
        `
        SELECT property_id, url, alt_text as altText, image_type as imageType, image_order as imageOrder
        FROM images
        WHERE property_id = ANY($1::uuid[])
        ORDER BY property_id, image_order
      `,
        [propertyIds]
      );

      // Group images by property ID
      const imagesMap = new Map();
      imagesResult.rows.forEach((img) => {
        if (!imagesMap.has(img.property_id)) {
          imagesMap.set(img.property_id, []);
        }
        imagesMap.get(img.property_id).push(img);
      });

      // Add images to each property and format price
      const propertiesWithImages = properties.map((property) => {
        const propertyImages = imagesMap.get(property.id) || [];
        return {
          id: property.id,
          title: property.title,
          description:
            property.description || property.details?.description || "",
          price: `KSh ${property.price.toLocaleString()}`,
          location: property.location,
          beds: property.bedrooms || property.beds || 0,
          baths: property.bathrooms || property.baths || 0,
          sqft: property.sqft || 0,
          parking: property.parking_spaces || property.parking || 0,
          propertyType:
            property.property_type || property.propertyType || "Property",
          status: property.status || "available",
          featured: property.featured || false,
          details: {
            ...property.details,
            amenities: property.amenities || property.details?.amenities || [],
            features: property.features || property.details?.features || [],
            nearByLandmarks: property.nearby_landmarks || property.details?.nearByLandmarks || property.details?.nearby_landmarks || [],
          },
          createdAt: property.created_at,
          image: propertyImages[0]?.url || "/placeholder-image.jpg", // First image as main image
          images: propertyImages,
        };
      });

      await pool.end();
      return propertiesWithImages;
    }

    await pool.end();
    return [];
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
};

/**
 * Get property by ID from the database
 */
export const getPropertyById = async (id: string) => {
  try {
    const pool = getDbPool();

    const propertyResult = await pool.query(
      `
      SELECT
        p.id,
        p.title,
        p.description,
        p.price,
        p.location,
        p.bedrooms as beds,
        p.bathrooms as baths,
        p.sqft,
        p.parking_spaces as parking,
        p.property_type,
        p.status,
        p.featured,
        p.details,
        p.created_at as createdAt,
        p.land_size,
        p.furnishing,
        p.property_status,
        p.property_age,
        p.floor,
        p.total_floors,
        p.facing,
        p.year_built,
        p.amenities,
        p.features,
        p.nearby_landmarks
      FROM properties p
      WHERE p.id = $1
    `,
      [id]
    );

    if (propertyResult.rows.length === 0) {
      return null;
    }

    const property = propertyResult.rows[0];

    // Get property images
    const imagesResult = await pool.query(
      `
      SELECT url, alt_text as altText, image_type as imageType, image_order as imageOrder
      FROM images
      WHERE property_id = $1
      ORDER BY image_order
    `,
      [id]
    );

    // Structure property details with specific fields
    const structuredDetails = {
      bedrooms: property.beds || property.details?.bedrooms || 0,
      bathrooms: property.baths || property.details?.bathrooms || 0,
      parking: property.parking || property.details?.parking || 0,
      landSize:
        property.land_size ||
        property.details?.landSize ||
        property.details?.land_size ||
        "",
      yearBuilt: property.year_built || property.details?.yearBuilt || 0,
      propertyType:
        property.property_type ||
        property.details?.propertyType ||
        "Property",
      furnishing: property.furnishing || property.details?.furnishing || "",
      utilities: property.details?.utilities || [],
      propertyStatus:
        property.property_status ||
        property.details?.propertyStatus ||
        "Ready to Move",
      propertyAge: property.property_age || property.details?.propertyAge || "",
      floor: property.floor || property.details?.floor || "",
      totalFloors: property.total_floors || property.details?.totalFloors || "",
      facing: property.facing || property.details?.facing || "",
      nearByLandmarks:
        property.nearby_landmarks ||
        property.details?.nearByLandmarks ||
        property.details?.nearby_landmarks ||
        [],
      amenities: property.amenities || property.details?.amenities || [],
      description: property.description || property.details?.description || "",
      features: property.features || property.details?.features || [],
    };

    const formattedProperty = {
      id: property.id,
      title: property.title,
      description: property.description || property.details?.description || "",
      price: `KSh ${property.price.toLocaleString()}`,
      location: property.location,
      beds: property.beds || 0,
      baths: property.baths || 0,
      sqft: property.sqft || 0,
      parking: property.parking || 0,
      image: imagesResult.rows[0]?.url || "/placeholder-image.jpg", // First image as main image
      images: imagesResult.rows,
      propertyType:
        property.property_type || "Property",
      status: property.status || "available",
      featured: property.featured || false,
      createdAt: property.created_at,
      details: structuredDetails,
    };

    await pool.end();
    return formattedProperty;
  } catch (error) {
    console.error("Error fetching property by ID:", error);
    return null;
  }
};

/**
 * Create a new property in the database
 */
export const createProperty = async (propertyData: any) => {
  try {
    const pool = getDbPool();

    // Extract details from the property data
    const {
      title,
      description,
      price,
      location,
      beds,
      baths,
      sqft,
      land_size,
      year_built,
      furnishing,
      property_status,
      property_age,
      floor,
      total_floors,
      facing,
      propertyType,
      status,
      featured,
      parking,
      amenities,
      nearByLandmarks,
      features,
      utilities,
      images,
      details,
      ...otherDetails
    } = propertyData;

    // Extract numeric value from formatted price if needed
    let priceValue = price;
    if (typeof price === "string") {
      // Remove currency symbols and commas, then parse as float
      priceValue = parseFloat(price.replace(/[^\d.-]/g, ""));
    }

    // Insert the property into the database
    const result = await pool.query(
      `
      INSERT INTO properties (
        title,
        description,
        price,
        location,
        bedrooms,
        bathrooms,
        sqft,
        land_size,
        year_built,
        furnishing,
        property_status,
        property_age,
        floor,
        total_floors,
        facing,
        property_type,
        status,
        featured,
        parking_spaces,
        details,
        amenities,
        features,
        nearby_landmarks
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING id
    `,
      [
        title,
        description,
        typeof priceValue === "number"
          ? priceValue
          : parseFloat(priceValue.toString()) || 0,
        location,
        beds || 0,
        baths || 0,
        sqft || 0,
        land_size,
        year_built,
        furnishing,
        property_status,
        property_age,
        floor,
        total_floors,
        facing,
        propertyType,
        status || "draft",
        featured || false,
        parking || 0,
        {
          ...details,
          ...otherDetails,
          amenities: amenities || [],
          nearByLandmarks: nearByLandmarks || [],
          features: features || [],
          utilities: utilities || [],
        },
        amenities || [],
        features || [],
        nearByLandmarks || []
      ]
    );

    const newPropertyId = result.rows[0].id;

    // If images are provided, insert them as well
    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await pool.query(
          `
          INSERT INTO images (property_id, url, alt_text, image_order, image_type)
          VALUES ($1, $2, $3, $4, $5)
        `,
          [
            newPropertyId,
            img.url,
            img.altText || img.alt_text || "",
            i,
            img.imageType || img.image_type || "property",
          ]
        );
      }
    }

    await pool.end();

    // Return the newly created property by fetching it
    return await getPropertyById(newPropertyId.toString());
  } catch (error) {
    console.error("Error creating property:", error);
    return null;
  }
};

/**
 * Update property in the database
 */
export const updateProperty = async (id: string, propertyData: any) => {
  try {
    const pool = getDbPool();

    // Extract details from the property data
    const {
      title,
      description,
      price,
      location,
      beds,
      baths,
      sqft,
      land_size,
      year_built,
      furnishing,
      property_status,
      property_age,
      floor,
      total_floors,
      facing,
      propertyType,
      status,
      featured,
      parking,
      amenities,
      nearByLandmarks,
      features,
      utilities,
      images,
      details,
      ...otherDetails
    } = propertyData;

    // Extract numeric value from formatted price if needed
    let priceValue = price;
    if (typeof price === "string") {
      // Remove currency symbols and commas, then parse as float
      priceValue = parseFloat(price.replace(/[^\d.-]/g, ""));
    }

    // Update the property in the database
    const result = await pool.query(
      `
      UPDATE properties
      SET
        title = $1,
        description = $2,
        price = $3,
        location = $4,
        bedrooms = $5,
        bathrooms = $6,
        sqft = $7,
        land_size = $8,
        year_built = $9,
        furnishing = $10,
        property_status = $11,
        property_age = $12,
        floor = $13,
        total_floors = $14,
        facing = $15,
        property_type = $16,
        status = $17,
        featured = $18,
        parking_spaces = $19,
        details = $20,
        amenities = $21,
        features = $22,
        nearby_landmarks = $23,
        updated_at = NOW()
      WHERE id = $24
      RETURNING id
    `,
      [
        title,
        description,
        typeof priceValue === "number"
          ? priceValue
          : parseFloat(priceValue.toString()) || 0,
        location,
        beds || 0,
        baths || 0,
        sqft || 0,
        land_size,
        year_built,
        furnishing,
        property_status,
        property_age,
        floor,
        total_floors,
        facing,
        propertyType,
        status || "draft",
        featured || false,
        parking || 0,
        {
          ...details,
          ...otherDetails,
          amenities: amenities || [],
          nearByLandmarks: nearByLandmarks || [],
          features: features || [],
          utilities: utilities || [],
        },
        amenities || [],
        features || [],
        nearByLandmarks || [],
        id,
      ]
    );

    if (result.rowCount === 0) {
      await pool.end();
      return null;
    }

    // Update images - first delete existing ones
    await pool.query("DELETE FROM images WHERE property_id = $1", [id]);

    // Then add new images if provided
    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await pool.query(
          `
          INSERT INTO images (property_id, url, alt_text, image_order, image_type)
          VALUES ($1, $2, $3, $4, $5)
        `,
          [
            id,
            img.url,
            img.altText || img.alt_text || "",
            i,
            img.imageType || img.image_type || "property",
          ]
        );
      }
    }

    await pool.end();

    // Return the updated property by fetching it
    return await getPropertyById(id);
  } catch (error) {
    console.error("Error updating property:", error);
    return null;
  }
};

/**
 * Delete property from the database
 */
export const deleteProperty = async (id: string) => {
  try {
    const pool = getDbPool();

    // Delete associated images first
    await pool.query("DELETE FROM images WHERE property_id = $1", [id]);

    // Delete the property
    const result = await pool.query(
      "DELETE FROM properties WHERE id = $1 RETURNING id",
      [id]
    );

    await pool.end();

    // Return true if a row was deleted
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting property:", error);
    return false;
  }
};

/**
 * Get featured properties from the database
 */
export const getFeaturedProperties = async () => {
  try {
    const pool = getDbPool();

    const propertiesResult = await pool.query(`
      SELECT
        p.id,
        p.title,
        p.description,
        p.price,
        p.location,
        p.bedrooms as beds,
        p.bathrooms as baths,
        p.sqft,
        p.parking_spaces as parking,
        CASE
          WHEN p.property_type ~ '^[0-9]+[a-zA-Z_]' THEN
            REGEXP_REPLACE(p.property_type, '^[0-9]+', '')
          ELSE p.property_type
        END as propertyType,
        p.status,
        p.featured,
        p.details
      FROM properties p
      WHERE p.featured = true
      ORDER BY p.created_at DESC
      LIMIT 3
    `);

    const properties = propertiesResult.rows;

    if (properties.length > 0) {
      const propertyIds = properties.map((p) => p.id);

      const imagesResult = await pool.query(
        `
        SELECT property_id, url, alt_text as altText, image_type as imageType, image_order as imageOrder
        FROM images
        WHERE property_id = ANY($1::uuid[])
        AND image_type = 'property'
        ORDER BY property_id, image_order
      `,
        [propertyIds]
      );

      // Group property images by property ID
      const imagesMap = new Map();
      imagesResult.rows.forEach((img) => {
        if (!imagesMap.has(img.property_id)) {
          imagesMap.set(img.property_id, []);
        }
        imagesMap.get(img.property_id).push(img);
      });

      // Structure properties with their first image as the main image
      const structuredProperties = properties.map((row) => {
        const propertyImages = imagesMap.get(row.id) || [];
        const mainImage = propertyImages[0]?.url || "/placeholder-image.jpg"; // Fallback image

        // Structure property details with specific fields
        const structuredDetails = {
          bedrooms: row.beds || row.details?.bedrooms || 0,
          bathrooms: row.baths || row.details?.bathrooms || 0,
          parking: row.parking || row.details?.parking || 0,
          landSize:
            row.land_size ||
            row.details?.landSize ||
            row.details?.land_size ||
            "",
          yearBuilt: row.year_built || row.details?.yearBuilt || 0,
          propertyType:
            row.property_type ||
            row.propertyType ||
            row.details?.propertyType ||
            "Property",
          furnishing: row.furnishing || row.details?.furnishing || "",
          utilities: row.details?.utilities || [],
          propertyStatus:
            row.property_status ||
            row.details?.propertyStatus ||
            "Ready to Move",
          propertyAge: row.property_age || row.details?.propertyAge || "",
          floor: row.floor || row.details?.floor || "",
          totalFloors: row.total_floors || row.details?.totalFloors || "",
          facing: row.facing || row.details?.facing || "",
          nearByLandmarks:
            row.details?.nearByLandmarks || row.details?.nearby_landmarks || [],
          amenities: row.details?.amenities || [],
          description: row.description || row.details?.description || "",
          features: row.details?.features || [],
        };

        // Format the price properly
        const formattedPrice = `KSh ${row.price.toLocaleString()}`;

        return {
          id: row.id,
          title: row.title,
          location: row.location,
          price: formattedPrice,
          beds: row.beds || 0,
          baths: row.baths || 0,
          sqft: row.sqft || 0,
          parking: row.parking || 0,
          image: mainImage,
          images: propertyImages, // Include all images for property detail page
          description: row.description || row.details?.description || "",
          propertyType: row.property_type || row.propertyType || "Property",
          featured: row.featured || false,
          status: row.status || "available",
          details: structuredDetails,
        };
      });

      await pool.end();
      return structuredProperties;
    }

    await pool.end();
    return [];
  } catch (error) {
    console.error("Error fetching featured properties:", error);
    return [];
  }
};

/**
 * Get property types from the database
 */
export const getPropertyTypes = async () => {
  try {
    const pool = getDbPool();

    const result = await pool.query(`
      SELECT DISTINCT property_type
      FROM properties
      WHERE property_type IS NOT NULL AND property_type != ''
      ORDER BY property_type ASC
    `);

    await pool.end();

    // Return just the property types, filtering out null/empty values
    return result.rows.map((row) => row.property_type).filter(Boolean);
  } catch (error) {
    console.error("Error fetching property types:", error);
    return [];
  }
};

/**
 * Get property locations from the database
 */
export const getPropertyLocations = async () => {
  try {
    const pool = getDbPool();

    const result = await pool.query(`
      SELECT DISTINCT location
      FROM properties
      WHERE location IS NOT NULL AND location != ''
      ORDER BY location ASC
    `);

    await pool.end();

    // Return just the locations, filtering out null/empty values
    return result.rows.map((row) => row.location).filter(Boolean);
  } catch (error) {
    console.error("Error fetching property locations:", error);
    return [];
  }
};

/**
 * Get all users from the database
 */
export const getAllUsers = async () => {
  try {
    const pool = getDbPool();

    const usersResult = await pool.query(`
      SELECT 
        id,
        name,
        email,
        role,
        status,
        created_at as createdAt,
        updated_at as updatedAt,
        avatar_url as avatarUrl,
        last_login as lastLogin
      FROM users
      ORDER BY created_at DESC
    `);

    await pool.end();
    return usersResult.rows;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

/**
 * Get user by ID from the database
 */
export const getUserById = async (id: string) => {
  try {
    const pool = getDbPool();

    const userResult = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        status,
        created_at as createdAt,
        updated_at as updatedAt,
        avatar_url as avatarUrl,
        last_login as lastLogin
      FROM users
      WHERE id = $1
    `,
      [id]
    );

    const user = userResult.rows[0] || null;

    await pool.end();
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
};

/**
 * Create a new user in the database
 */
export const createUser = async (userData: any) => {
  try {
    const pool = getDbPool();

    // Hash the password before storing
    const hashedPassword = await hashPassword(userData.password);

    const result = await pool.query(
      `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        status,
        avatar_url
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, role, status, created_at as createdAt
    `,
      [
        userData.name,
        userData.email,
        hashedPassword,
        userData.role || "client",
        userData.status || "active",
        userData.avatarUrl || null,
      ]
    );

    await pool.end();
    return result.rows[0];
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
};

/**
 * Update user in the database
 */
export const updateUser = async (id: string, userData: any) => {
  try {
    const pool = getDbPool();

    let query = "UPDATE users SET ";
    const queryParams: any[] = [];
    let paramIndex = 1;
    const updates: string[] = [];

    // Build dynamic query based on provided fields
    if (userData.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      queryParams.push(userData.name);
      paramIndex++;
    }
    if (userData.email !== undefined) {
      updates.push(`email = $${paramIndex}`);
      queryParams.push(userData.email);
      paramIndex++;
    }
    if (userData.role !== undefined) {
      updates.push(`role = $${paramIndex}`);
      queryParams.push(userData.role);
      paramIndex++;
    }
    if (userData.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      queryParams.push(userData.status);
      paramIndex++;
    }
    if (userData.password) {
      const hashedPassword = await hashPassword(userData.password);
      updates.push(`password_hash = $${paramIndex}`);
      queryParams.push(hashedPassword);
      paramIndex++;
    }
    if (userData.avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramIndex}`);
      queryParams.push(userData.avatarUrl);
      paramIndex++;
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`);

    query += updates.join(", ");
    query += ` WHERE id = $${paramIndex} RETURNING id, name, email, role, status, updated_at as updatedAt`;
    queryParams.push(id);

    const result = await pool.query(query, queryParams);
    const updatedUser = result.rows[0] || null;

    await pool.end();
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
};

/**
 * Delete user from the database
 */
export const deleteUser = async (id: string) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );
    const deleted = result.rowCount > 0;

    await pool.end();
    return deleted;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
};

/**
 * Get page content from the database by slug
 */
export const getPageContent = async (slug: string) => {
  try {
    const pool = getDbPool();

    const pageResult = await pool.query(
      `
      SELECT 
        id,
        title,
        slug,
        content,
        hero_title as heroTitle,
        hero_subtitle as heroSubtitle,
        hero_description as heroDescription,
        hero_image_url as heroImageUrl,
        seo_title as seoTitle,
        seo_description as seoDescription,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM pages
      WHERE slug = $1 AND status = 'published'
    `,
      [slug]
    );

    const page = pageResult.rows[0] || null;

    if (page) {
      // Process hero image URL to ensure it's a proper absolute URL
      if (page.heroImageUrl) {
        // If it's a relative path, make it absolute
        if (page.heroImageUrl.startsWith('/')) {
          // Use default format for local images
          page.heroImageUrl = page.heroImageUrl;
        } else if (!page.heroImageUrl.startsWith('http')) {
          // If it's not a full URL, it might be a file name that needs to be converted
          // For Supabase storage, construct the proper URL
          if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
            const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
            page.heroImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-images/${page.heroImageUrl}`;
          }
        }
      }

      if (page.heroImageUrl) {
        // If page has hero image, also get content images
        const imagesResult = await pool.query(
          `
          SELECT url, alt_text as altText, image_type as imageType, section_name as sectionName, image_order as imageOrder
          FROM content_images
          WHERE page_id = $1
          ORDER BY image_order
        `,
          [page.id]
        );

        page.contentImages = imagesResult.rows;
      }
    }

    await pool.end();
    return page;
  } catch (error) {
    console.error("Error fetching page content:", error);
    return null;
  }
};

/**
 * Get all pages from the database
 */
export const getAllPages = async () => {
  try {
    const pool = getDbPool();

    const pagesResult = await pool.query(`
      SELECT 
        id,
        title,
        slug,
        content,
        hero_title as heroTitle,
        hero_subtitle as heroSubtitle,
        hero_description as heroDescription,
        hero_image_url as heroImageUrl,
        seo_title as seoTitle,
        seo_description as seoDescription,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM pages
      ORDER BY created_at DESC
    `);

    await pool.end();
    return pagesResult.rows;
  } catch (error) {
    console.error("Error fetching all pages:", error);
    return [];
  }
};

/**
 * Create a new page in the database
 */
export const createPage = async (pageData: any) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      INSERT INTO pages (
        title,
        slug,
        content,
        hero_title,
        hero_subtitle,
        hero_description,
        hero_image_url,
        seo_title,
        seo_description,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `,
      [
        pageData.title,
        pageData.slug,
        pageData.content,
        pageData.heroTitle,
        pageData.heroSubtitle,
        pageData.heroDescription,
        pageData.heroImageUrl,
        pageData.seoTitle,
        pageData.seoDescription,
        pageData.status || "draft",
      ]
    );

    await pool.end();
    return result.rows[0];
  } catch (error) {
    console.error("Error creating page:", error);
    return null;
  }
};

/**
 * Update page in the database
 */
export const updatePage = async (id: string, pageData: any) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      UPDATE pages
      SET
        title = $1,
        slug = $2,
        content = $3,
        hero_title = $4,
        hero_subtitle = $5,
        hero_description = $6,
        hero_image_url = $7,
        seo_title = $8,
        seo_description = $9,
        status = $10,
        updated_at = NOW()
      WHERE id = $11
      RETURNING id
    `,
      [
        pageData.title,
        pageData.slug,
        pageData.content,
        pageData.heroTitle,
        pageData.heroSubtitle,
        pageData.heroDescription,
        pageData.heroImageUrl,
        pageData.seoTitle,
        pageData.seoDescription,
        pageData.status,
        id,
      ]
    );

    await pool.end();
    return result.rows[0];
  } catch (error) {
    console.error("Error updating page:", error);
    return null;
  }
};

/**
 * Delete page from the database
 */
export const deletePage = async (id: string) => {
  try {
    const pool = getDbPool();

    // Delete associated content images first
    await pool.query("DELETE FROM content_images WHERE page_id = $1", [id]);

    // Delete the page
    const result = await pool.query(
      "DELETE FROM pages WHERE id = $1 RETURNING id",
      [id]
    );

    await pool.end();
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting page:", error);
    return false;
  }
};

/**
 * Get user's favorite properties
 */
export const getUserFavorites = async (userId: string) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      SELECT 
        f.id as favorite_id,
        f.property_id,
        f.created_at as added_at,
        p.title,
        p.location,
        p.price,
        p.bedrooms,
        p.bathrooms,
        p.sqft,
        CASE
          WHEN p.property_type ~ '^[0-9]+[a-zA-Z_]' THEN
            REGEXP_REPLACE(p.property_type, '^[0-9]+', '')
          ELSE p.property_type
        END as propertyType
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `,
      [userId]
    );

    // Get images for each property
    if (result.rows.length > 0) {
      const propertyIds = result.rows.map((row) => row.property_id);

      const imagesResult = await pool.query(
        `
        SELECT property_id, url, alt_text as altText, image_type as imageType
        FROM images
        WHERE property_id = ANY($1::uuid[])
        ORDER BY image_order
      `,
        [propertyIds]
      );

      // Group images by property ID
      const imagesMap = new Map();
      imagesResult.rows.forEach((img) => {
        if (!imagesMap.has(img.property_id)) {
          imagesMap.set(img.property_id, []);
        }
        imagesMap.get(img.property_id).push(img);
      });

      // Add first image as main image to each property
      const propertiesWithImages = result.rows.map((property) => ({
        ...property,
        image:
          imagesMap.get(property.property_id)?.[0]?.url ||
          "/placeholder-image.jpg",
        allImages: imagesMap.get(property.property_id) || [],
      }));

      await pool.end();
      return propertiesWithImages;
    }

    await pool.end();
    return [];
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return [];
  }
};

/**
 * Add property to user's favorites
 */
export const addPropertyToFavorite = async (
  userId: string,
  propertyId: string
) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      INSERT INTO favorites (user_id, property_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, property_id) DO NOTHING
      RETURNING id
    `,
      [userId, propertyId]
    );

    await pool.end();
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error adding property to favorites:", error);
    return false;
  }
};

/**
 * Remove property from user's favorites
 */
export const removePropertyFromFavorite = async (
  userId: string,
  propertyId: string
) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      DELETE FROM favorites 
      WHERE user_id = $1 AND property_id = $2
      RETURNING id
    `,
      [userId, propertyId]
    );

    await pool.end();
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error removing property from favorites:", error);
    return false;
  }
};

/**
 * Get home hero content
 */
export const getHomeHeroContent = async () => {
  try {
    const page = await getPageContent("/");

    return {
      heroTitle: page?.heroTitle || "Discover Premium Kenyan Properties",
      heroSubtitle:
        page?.heroSubtitle ||
        "Experience elegance, comfort, and sophistication in every detail",
      heroDescription: page?.heroDescription,
      heroImageUrl: page?.heroImageUrl || "/img16.jpg",
    };
  } catch (error) {
    console.error("Error fetching home hero content:", error);
    return {
      heroTitle: "Discover Premium Kenyan Properties",
      heroSubtitle:
        "Experience elegance, comfort, and sophistication in every detail",
      heroDescription: null,
      heroImageUrl: "/img16.jpg",
    };
  }
};

/**
 * Get about page content
 */
export const getAboutPageContent = async () => {
  try {
    const page = await getPageContent("about");

    return {
      title: page?.title || "About Luxury Kenya Real Estate",
      content: page?.content,
      heroTitle: page?.heroTitle,
      heroSubtitle: page?.heroSubtitle,
      heroDescription: page?.heroDescription,
      heroImageUrl: page?.heroImageUrl,
    };
  } catch (error) {
    console.error("Error fetching about page content:", error);
    return {
      title: "About Luxury Kenya Real Estate",
      content: null,
      heroTitle: null,
      heroSubtitle: null,
      heroDescription: null,
      heroImageUrl: null,
    };
  }
};

/**
 * Get services page content
 */
export const getServicesPageContent = async () => {
  try {
    const page = await getPageContent("services");

    return {
      title: page?.title || "Our Services",
      content: page?.content,
      heroTitle: page?.heroTitle,
      heroSubtitle: page?.heroSubtitle,
      heroDescription: page?.heroDescription,
      heroImageUrl: page?.heroImageUrl,
    };
  } catch (error) {
    console.error("Error fetching services page content:", error);
    return {
      title: "Our Services",
      content: null,
      heroTitle: null,
      heroSubtitle: null,
      heroDescription: null,
      heroImageUrl: null,
    };
  }
};

// Add more functions here for other admin operations
// For example: blog posts, reviews, inquiries, appointments, etc.

/**
 * Get all blog posts from the database
 */
export const getAllBlogPosts = async () => {
  try {
    const pool = getDbPool();

    const postsResult = await pool.query(`
      SELECT 
        bp.id,
        bp.title,
        bp.excerpt,
        bp.content,
        bp.author_id,
        bp.status,
        bp.category,
        bp.published_at as publishedAt,
        bp.created_at as createdAt,
        bp.updated_at as updatedAt,
        u.name as authorName
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      ORDER BY bp.created_at DESC
    `);

    await pool.end();
    return postsResult.rows;
  } catch (error) {
    console.error("Error fetching all blog posts:", error);
    return [];
  }
};

/**
 * Get blog post by ID
 */
export const getBlogPost = async (id: string) => {
  try {
    const pool = getDbPool();

    const postResult = await pool.query(
      `
      SELECT 
        bp.id,
        bp.title,
        bp.excerpt,
        bp.content,
        bp.author_id,
        bp.status,
        bp.category,
        bp.published_at as publishedAt,
        bp.created_at as createdAt,
        bp.updated_at as updatedAt,
        u.name as authorName
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.id = $1
    `,
      [id]
    );

    const post = postResult.rows[0] || null;

    await pool.end();
    return post;
  } catch (error) {
    console.error("Error fetching blog post by ID:", error);
    return null;
  }
};

/**
 * Create a new blog post
 */
export const createBlogPost = async (postData: any) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      INSERT INTO blog_posts (
        title,
        excerpt,
        content,
        author_id,
        status,
        category,
        published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
      [
        postData.title,
        postData.excerpt,
        postData.content,
        postData.author_id,
        postData.status || "draft",
        postData.category || "Uncategorized",
        postData.published_at,
      ]
    );

    await pool.end();
    return result.rows[0];
  } catch (error) {
    console.error("Error creating blog post:", error);
    return null;
  }
};

/**
 * Update blog post
 */
export const updateBlogPost = async (id: string, postData: any) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      UPDATE blog_posts
      SET
        title = $1,
        excerpt = $2,
        content = $3,
        status = $4,
        category = $5,
        published_at = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING id
    `,
      [
        postData.title,
        postData.excerpt,
        postData.content,
        postData.status,
        postData.category,
        postData.published_at,
        id,
      ]
    );

    await pool.end();
    return result.rows[0];
  } catch (error) {
    console.error("Error updating blog post:", error);
    return null;
  }
};

/**
 * Delete blog post
 */
export const deleteBlogPost = async (id: string) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      "DELETE FROM blog_posts WHERE id = $1 RETURNING id",
      [id]
    );

    await pool.end();
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return false;
  }
};

/**
 * Get all reviews from the database
 */
export const getAllReviews = async () => {
  try {
    const pool = getDbPool();

    const reviewsResult = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.status,
        r.created_at as createdAt,
        u.name as userName,
        u.email as userEmail,
        p.title as propertyTitle
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN properties p ON r.property_id = p.id
      ORDER BY r.created_at DESC
    `);

    await pool.end();
    return reviewsResult.rows;
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    return [];
  }
};

/**
 * Get review by ID
 */
export const getReviewById = async (id: string) => {
  try {
    const pool = getDbPool();

    const reviewResult = await pool.query(
      `
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.status,
        r.created_at as createdAt,
        u.name as userName,
        u.email as userEmail,
        p.title as propertyTitle
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN properties p ON r.property_id = p.id
      WHERE r.id = $1
    `,
      [id]
    );

    const review = reviewResult.rows[0] || null;

    await pool.end();
    return review;
  } catch (error) {
    console.error("Error fetching review by ID:", error);
    return null;
  }
};

/**
 * Create a new review
 */
export const createReview = async (reviewData: any) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      INSERT INTO reviews (
        user_id,
        property_id,
        rating,
        comment,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
      [
        reviewData.userId,
        reviewData.propertyId,
        reviewData.rating,
        reviewData.comment,
        reviewData.status || "pending",
      ]
    );

    await pool.end();
    return result.rows[0];
  } catch (error) {
    console.error("Error creating review:", error);
    return null;
  }
};

/**
 * Update review
 */
export const updateReview = async (id: string, reviewData: any) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      UPDATE reviews
      SET
        rating = $1,
        comment = $2,
        status = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING id
    `,
      [reviewData.rating, reviewData.comment, reviewData.status, id]
    );

    await pool.end();
    return result.rows[0];
  } catch (error) {
    console.error("Error updating review:", error);
    return null;
  }
};

/**
 * Delete review
 */
export const deleteReview = async (id: string) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      "DELETE FROM reviews WHERE id = $1 RETURNING id",
      [id]
    );

    await pool.end();
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting review:", error);
    return false;
  }
};

/**
 * Get inquiry by ID
 */
export const getInquiryById = async (id: string) => {
  try {
    const pool = getDbPool();

    const inquiryResult = await pool.query(
      `
      SELECT 
        i.id,
        i.name,
        i.email,
        i.phone,
        i.message,
        i.status,
        i.created_at as createdAt,
        p.title as propertyTitle,
        u.name as userName
      FROM inquiries i
      LEFT JOIN properties p ON i.property_id = p.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.id = $1
    `,
      [id]
    );

    const inquiry = inquiryResult.rows[0] || null;

    await pool.end();
    return inquiry;
  } catch (error) {
    console.error("Error fetching inquiry by ID:", error);
    return null;
  }
};

/**
 * Create a new inquiry
 */
export const createInquiry = async (inquiryData: any) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      INSERT INTO inquiries (
        name,
        email,
        phone,
        message,
        property_id,
        user_id,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
      [
        inquiryData.name,
        inquiryData.email,
        inquiryData.phone,
        inquiryData.message,
        inquiryData.propertyId,
        inquiryData.userId,
        inquiryData.status || "new",
      ]
    );

    await pool.end();
    return result.rows[0];
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return null;
  }
};

/**
 * Update inquiry status
 */
export const updateInquiryStatus = async (id: string, status: string) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      UPDATE inquiries
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id
    `,
      [status, id]
    );

    await pool.end();
    return result.rows[0];
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    return null;
  }
};

/**
 * Get all inquiries
 */
export const getAllInquiries = async () => {
  try {
    const pool = getDbPool();

    const inquiriesResult = await pool.query(`
      SELECT 
        i.id,
        i.name,
        i.email,
        i.phone,
        i.message,
        i.status,
        i.created_at as createdAt,
        i.updated_at as updatedAt,
        p.title as propertyTitle,
        u.name as userName
      FROM inquiries i
      LEFT JOIN properties p ON i.property_id = p.id
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
    `);

    await pool.end();
    return inquiriesResult.rows;
  } catch (error) {
    console.error("Error fetching all inquiries:", error);
    return [];
  }
};

/**
 * Delete inquiry
 */
export const deleteInquiry = async (id: string) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      "DELETE FROM inquiries WHERE id = $1 RETURNING id",
      [id]
    );

    await pool.end();
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return false;
  }
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (id: string) => {
  try {
    const pool = getDbPool();

    const appointmentResult = await pool.query(
      `
      SELECT 
        a.id,
        a.appointment_date as appointmentDate,
        a.appointment_time as appointmentTime,
        a.status,
        a.notes,
        a.created_at as createdAt,
        u.name as userName,
        p.title as propertyTitle,
        agent.name as agentName
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN properties p ON a.property_id = p.id
      LEFT JOIN users agent ON a.agent_id = agent.id
      WHERE a.id = $1
    `,
      [id]
    );

    const appointment = appointmentResult.rows[0] || null;

    await pool.end();
    return appointment;
  } catch (error) {
    console.error("Error fetching appointment by ID:", error);
    return null;
  }
};

/**
 * Create a new appointment
 */
export const createAppointment = async (appointmentData: any) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      INSERT INTO appointments (
        user_id,
        property_id,
        agent_id,
        appointment_date,
        appointment_time,
        status,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
      [
        appointmentData.userId,
        appointmentData.propertyId,
        appointmentData.agentId,
        appointmentData.appointmentDate,
        appointmentData.appointmentTime,
        appointmentData.status || "pending",
        appointmentData.notes,
      ]
    );

    await pool.end();
    return result.rows[0];
  } catch (error) {
    console.error("Error creating appointment:", error);
    return null;
  }
};

/**
 * Update appointment
 */
export const updateAppointment = async (id: string, appointmentData: any) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      UPDATE appointments
      SET
        appointment_date = $1,
        appointment_time = $2,
        status = $3,
        notes = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING id
    `,
      [
        appointmentData.appointmentDate,
        appointmentData.appointmentTime,
        appointmentData.status,
        appointmentData.notes,
        id,
      ]
    );

    await pool.end();
    return result.rows[0];
  } catch (error) {
    console.error("Error updating appointment:", error);
    return null;
  }
};

/**
 * Delete appointment
 */
export const deleteAppointment = async (id: string) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      "DELETE FROM appointments WHERE id = $1 RETURNING id",
      [id]
    );

    await pool.end();
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return false;
  }
};

/**
 * Get all appointments
 */
export const getAllAppointments = async () => {
  try {
    const pool = getDbPool();

    const appointmentsResult = await pool.query(`
      SELECT 
        a.id,
        a.appointment_date as appointmentDate,
        a.appointment_time as appointmentTime,
        a.status,
        a.notes,
        a.created_at as createdAt,
        a.updated_at as updatedAt,
        u.name as userName,
        u.email as userEmail,
        p.title as propertyTitle,
        agent.name as agentName
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN properties p ON a.property_id = p.id
      LEFT JOIN users agent ON a.agent_id = agent.id
      ORDER BY a.appointment_date, a.appointment_time
    `);

    await pool.end();
    return appointmentsResult.rows;
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    return [];
  }
};

/**
 * Update user password
 */
export const updateUserPassword = async (
  userId: string,
  newPassword: string
) => {
  try {
    const pool = getDbPool();

    const hashedPassword = await hashPassword(newPassword);

    const result = await pool.query(
      `
      UPDATE users
      SET 
        password_hash = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING id
    `,
      [hashedPassword, userId]
    );

    await pool.end();
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error updating user password:", error);
    return false;
  }
};

/**
 * Initialize database tables
 */
export const initializeTables = async () => {
  try {
    const pool = getDbPool();

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'client' CHECK (role IN ('public', 'client', 'agent', 'admin')),
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        avatar_url TEXT,
        license_number TEXT,
        company_name TEXT,
        phone TEXT,
        bio TEXT,
        specializations TEXT[],
        years_experience INTEGER,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create properties table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        location TEXT NOT NULL,
        bedrooms INTEGER,
        bathrooms INTEGER,
        sqft INTEGER,
        land_size TEXT,
        year_built INTEGER,
        furnishing TEXT,
        property_status TEXT,
        property_age TEXT,
        floor TEXT,
        total_floors TEXT,
        facing TEXT,
        property_type TEXT CHECK (property_type IN ('house', 'apartment', 'penthouse', 'villa', 'commercial', 'land', 'estate_home', 'beach_house', 'detached_house', 'farm_house', 'bungalow', 'mansion', 'cottage', 'duplex')),
        status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'pending', 'leased')),
        details JSONB,
        featured BOOLEAN DEFAULT FALSE,
        amenities TEXT[], -- Array of amenities
        features TEXT[], -- Array of features
        nearby_landmarks TEXT[], -- Array of nearby landmarks
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create images table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS images (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        alt_text TEXT,
        image_order INTEGER DEFAULT 0,
        image_type TEXT DEFAULT 'property' CHECK (image_type IN ('property', 'floor_plan', 'gallery', 'user_avatar', 'logo', 'marketing')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create pages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT,
        hero_title TEXT,
        hero_subtitle TEXT,
        hero_description TEXT,
        hero_image_url TEXT,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        seo_title TEXT,
        seo_description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create content_images table (for non-property images like hero images, etc.)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS content_images (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
        section_name TEXT, -- identifies which section this image belongs to (hero, banner, gallery, etc.)
        url TEXT NOT NULL,
        alt_text TEXT,
        image_order INTEGER DEFAULT 0,
        image_type TEXT DEFAULT 'general' CHECK (image_type IN ('hero', 'banner', 'gallery', 'logo', 'marketing', 'testimonial', 'feature', 'general')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create favorites table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, property_id)
      );
    `);

    // Create reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create inquiries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        message TEXT,
        property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'closed', 'converted', 'spam')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create appointments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create viewings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS viewings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        viewing_date DATE NOT NULL,
        viewing_time TIME NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_viewings_property_id ON viewings(property_id);
      CREATE INDEX IF NOT EXISTS idx_viewings_user_id ON viewings(user_id);
      CREATE INDEX IF NOT EXISTS idx_viewings_viewing_date ON viewings(viewing_date);
    `);

    await pool.end();
    console.log("Database tables initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing tables:", error);
    return false;
  }
};

/**
 * Check if admin user exists
 */
export const checkAdminUser = async () => {
  try {
    const pool = getDbPool();

    const result = await pool.query(`
      SELECT id, email, role, status
      FROM users
      WHERE role = 'admin' AND status != 'suspended'
      LIMIT 1
    `);

    await pool.end();
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error checking admin user:", error);
    return null;
  }
};

/**
 * Create admin user
 */
export const createAdminUser = async (userData: any) => {
  try {
    const pool = getDbPool();

    const hashedPassword = await hashPassword(userData.password);

    const result = await pool.query(
      `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role
    `,
      [userData.name, userData.email, hashedPassword, "admin", "active"]
    );

    await pool.end();
    return result.rows[0];
  } catch (error) {
    console.error("Error creating admin user:", error);
    return null;
  }
};

/**
 * Get all property images
 */
export const getAllPropertyImages = async () => {
  try {
    const pool = getDbPool();

    const result = await pool.query(`
      SELECT 
        i.id,
        i.property_id,
        i.url,
        i.alt_text as altText,
        i.image_order as imageOrder,
        i.image_type as imageType,
        i.created_at as createdAt,
        p.title as propertyName
      FROM images i
      LEFT JOIN properties p ON i.property_id = p.id
      ORDER BY i.created_at DESC
    `);

    await pool.end();
    return result.rows;
  } catch (error) {
    console.error("Error fetching property images:", error);
    return [];
  }
};

/**
 * Upload property image
 */
export const uploadPropertyImage = async (imageData: any) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      INSERT INTO images (
        property_id,
        url,
        alt_text,
        image_order,
        image_type
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
      [
        imageData.propertyId,
        imageData.url,
        imageData.altText,
        imageData.imageOrder || 0,
        imageData.imageType || "property",
      ]
    );

    await pool.end();
    return result.rows[0];
  } catch (error) {
    console.error("Error uploading property image:", error);
    return null;
  }
};

/**
 * Delete property image
 */
export const deletePropertyImage = async (imageId: string) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      "DELETE FROM images WHERE id = $1 RETURNING id",
      [imageId]
    );

    await pool.end();
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting property image:", error);
    return false;
  }
};

/**
 * Get properties with filters
 */
export const getPropertiesWithFilters = async (filters: any) => {
  try {
    const pool = getDbPool();

    let query = `
      SELECT
        p.id,
        p.title,
        p.description,
        p.price,
        p.location,
        p.bedrooms as beds,
        p.bathrooms as baths,
        p.sqft,
        p.parking_spaces as parking,
        CASE
          WHEN p.property_type ~ '^[0-9]+[a-zA-Z_]' THEN
            REGEXP_REPLACE(p.property_type, '^[0-9]+', '')
          ELSE p.property_type
        END as propertyType,
        p.status,
        p.featured,
        p.details
      FROM properties p
    `;

    const queryParams: any[] = [];
    let paramIndex = 1;
    const conditions: string[] = [];

    if (filters.location) {
      conditions.push(`p.location ILIKE $${paramIndex}`);
      queryParams.push(`%${filters.location}%`);
      paramIndex++;
    }

    if (filters.propertyType) {
      conditions.push(`p.property_type = $${paramIndex}`);
      queryParams.push(filters.propertyType);
      paramIndex++;
    }

    if (filters.minPrice) {
      conditions.push(`p.price >= $${paramIndex}`);
      queryParams.push(parseInt(filters.minPrice));
      paramIndex++;
    }

    if (filters.maxPrice) {
      conditions.push(`p.price <= $${paramIndex}`);
      queryParams.push(parseInt(filters.maxPrice));
      paramIndex++;
    }

    if (filters.beds) {
      conditions.push(`p.bedrooms >= $${paramIndex}`);
      queryParams.push(parseInt(filters.beds));
      paramIndex++;
    }

    if (filters.baths) {
      conditions.push(`p.bathrooms >= $${paramIndex}`);
      queryParams.push(parseInt(filters.baths));
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY p.created_at DESC";

    const result = await pool.query(query, queryParams);

    // Get all property images for the filtered properties
    if (result.rows.length > 0) {
      const propertyIds = result.rows.map((prop) => prop.id);

      const imagesResult = await pool.query(
        `
        SELECT property_id, url, alt_text as altText, image_type as imageType, image_order as imageOrder
        FROM images
        WHERE property_id = ANY($1::uuid[])
        ORDER BY property_id, image_order
      `,
        [propertyIds]
      );

      // Group images by property ID
      const imagesMap = new Map();
      imagesResult.rows.forEach((img) => {
        if (!imagesMap.has(img.property_id)) {
          imagesMap.set(img.property_id, []);
        }
        imagesMap.get(img.property_id).push(img);
      });

      // Add images to each property
      const propertiesWithImages = result.rows.map((property) => {
        const propertyImages = imagesMap.get(property.id) || [];
        return {
          ...property,
          image: propertyImages[0]?.url || "/placeholder-image.jpg", // First image as main image
          images: propertyImages,
        };
      });

      await pool.end();
      return propertiesWithImages;
    }

    await pool.end();
    return result.rows;
  } catch (error) {
    console.error("Error fetching properties with filters:", error);
    return [];
  }
};

/**
 * Get dashboard stats
 */
export const getDashboardStats = async () => {
  try {
    const pool = getDbPool();

    // Fetch counts from different tables
    const [propertiesResult, usersResult, inquiriesResult, reviewsResult] =
      await Promise.all([
        pool.query("SELECT COUNT(*) FROM properties"),
        pool.query("SELECT COUNT(*) FROM users"),
        pool.query("SELECT COUNT(*) FROM inquiries"),
        pool.query("SELECT COUNT(*) FROM reviews WHERE status = 'pending'"),
      ]);

    const stats = {
      totalProperties: parseInt(propertiesResult.rows[0].count),
      totalUsers: parseInt(usersResult.rows[0].count),
      totalInquiries: parseInt(inquiriesResult.rows[0].count),
      pendingReviews: parseInt(reviewsResult.rows[0].count),
    };

    // Calculate published properties
    const publishedResult = await pool.query(
      "SELECT COUNT(*) FROM properties WHERE status = 'Published' OR status = 'published'"
    );
    stats.publishedProperties = parseInt(publishedResult.rows[0].count);

    await pool.end();
    return stats;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalProperties: 0,
      totalUsers: 0,
      publishedProperties: 0,
      totalInquiries: 0,
      pendingReviews: 0,
    };
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        status,
        created_at as createdAt,
        updated_at as updatedAt,
        avatar_url as avatarUrl,
        last_login as lastLogin
      FROM users
      WHERE email = $1
    `,
      [email]
    );

    const user = result.rows[0] || null;

    await pool.end();
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
};

/**
 * Update user
 */
export const updateUserProfile = async (userId: string, updateData: any) => {
  try {
    const pool = getDbPool();

    let query = "UPDATE users SET ";
    const queryParams: any[] = [];
    let paramIndex = 1;
    const updates: string[] = [];

    // Build dynamic query based on provided fields
    if (updateData.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      queryParams.push(updateData.name);
      paramIndex++;
    }
    if (updateData.email !== undefined) {
      updates.push(`email = $${paramIndex}`);
      queryParams.push(updateData.email);
      paramIndex++;
    }
    if (updateData.role !== undefined) {
      updates.push(`role = $${paramIndex}`);
      queryParams.push(updateData.role);
      paramIndex++;
    }
    if (updateData.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      queryParams.push(updateData.status);
      paramIndex++;
    }
    if (updateData.avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramIndex}`);
      queryParams.push(updateData.avatarUrl);
      paramIndex++;
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`);

    query += updates.join(", ");
    query += ` WHERE id = $${paramIndex} RETURNING id, name, email, role, status`;
    queryParams.push(userId);

    const result = await pool.query(query, queryParams);
    const updatedUser = result.rows[0] || null;

    await pool.end();
    return updatedUser;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
};

/**
 * Get property detail content
 */
export const getPropertyDetailContent = async (id: string) => {
  return await getPropertyById(id);
};

/**
 * Schedule a property viewing
 */
export const scheduleViewing = async (viewingData: {
  propertyId: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  notes?: string;
}) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      INSERT INTO viewings (
        property_id,
        user_id,
        name,
        email,
        phone,
        viewing_date,
        viewing_time,
        notes,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING id, viewing_date, viewing_time
      `,
      [
        viewingData.propertyId,
        viewingData.userId || null,
        viewingData.name,
        viewingData.email,
        viewingData.phone,
        viewingData.date,
        viewingData.time,
        viewingData.notes || null
      ]
    );

    await pool.end();

    return result.rows[0];
  } catch (error) {
    console.error("Error scheduling viewing:", error);
    return null;
  }
};

/**
 * Get all scheduled viewings
 */
export const getAllViewings = async () => {
  try {
    const pool = getDbPool();

    const result = await pool.query(`
      SELECT
        v.id,
        v.property_id,
        v.user_id,
        v.name,
        v.email,
        v.phone,
        v.viewing_date,
        v.viewing_time,
        v.notes,
        v.status,
        v.created_at,
        p.title as propertyTitle,
        p.location as propertyLocation,
        u.name as userName
      FROM viewings v
      LEFT JOIN properties p ON v.property_id = p.id
      LEFT JOIN users u ON v.user_id = u.id
      ORDER BY v.viewing_date, v.viewing_time
    `);

    await pool.end();
    return result.rows;
  } catch (error) {
    console.error("Error fetching all viewings:", error);
    return [];
  }
};

/**
 * Get scheduled viewings by property ID
 */
export const getViewingsByPropertyId = async (propertyId: string) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(`
      SELECT
        v.id,
        v.property_id,
        v.user_id,
        v.name,
        v.email,
        v.phone,
        v.viewing_date,
        v.viewing_time,
        v.notes,
        v.status,
        v.created_at
      FROM viewings v
      WHERE v.property_id = $1
      ORDER BY v.viewing_date, v.viewing_time
    `, [propertyId]);

    await pool.end();
    return result.rows;
  } catch (error) {
    console.error("Error fetching viewings by property ID:", error);
    return [];
  }
};

/**
 * Get scheduled viewings by user ID
 */
export const getViewingsByUserId = async (userId: string) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(`
      SELECT
        v.id,
        v.property_id,
        v.name,
        v.email,
        v.phone,
        v.viewing_date,
        v.viewing_time,
        v.notes,
        v.status,
        v.created_at,
        p.title as propertyTitle,
        p.location as propertyLocation
      FROM viewings v
      LEFT JOIN properties p ON v.property_id = p.id
      WHERE v.user_id = $1
      ORDER BY v.viewing_date, v.viewing_time
    `, [userId]);

    await pool.end();
    return result.rows;
  } catch (error) {
    console.error("Error fetching viewings by user ID:", error);
    return [];
  }
};

/**
 * Update viewing status
 */
export const updateViewingStatus = async (viewingId: string, status: string) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      `
      UPDATE viewings
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id
      `,
      [status, viewingId]
    );

    await pool.end();
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error updating viewing status:", error);
    return false;
  }
};

/**
 * Delete a scheduled viewing
 */
export const deleteViewing = async (viewingId: string) => {
  try {
    const pool = getDbPool();

    const result = await pool.query(
      "DELETE FROM viewings WHERE id = $1 RETURNING id",
      [viewingId]
    );

    await pool.end();
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting viewing:", error);
    return false;
  }
};
