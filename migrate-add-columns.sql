-- Migration to add amenities, features, and nearby_landmarks columns to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities TEXT[];
ALTER TABLE properties ADD COLUMN IF NOT EXISTS features TEXT[];
ALTER TABLE properties ADD COLUMN IF NOT EXISTS nearby_landmarks TEXT[];

-- Update existing properties to have empty arrays if the columns didn't exist before
UPDATE properties SET amenities = '{}' WHERE amenities IS NULL;
UPDATE properties SET features = '{}' WHERE features IS NULL;
UPDATE properties SET nearby_landmarks = '{}' WHERE nearby_landmarks IS NULL;