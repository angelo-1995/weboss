-- Add tsvector columns and GIN indexes for full-text search
-- This migration adds FTS capabilities to users and groups tables

-- Add search_vector column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index on users search_vector
CREATE INDEX IF NOT EXISTS idx_users_search_vector ON users USING GIN (search_vector);

-- Add search_vector column to groups
ALTER TABLE groups ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index on groups search_vector
CREATE INDEX IF NOT EXISTS idx_groups_search_vector ON groups USING GIN (search_vector);

-- Populate existing users search_vector
UPDATE users SET search_vector = 
  to_tsvector('simple', COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') || ' ' || COALESCE(email, '') || ' ' || COALESCE(display_name, ''));

-- Populate existing groups search_vector
UPDATE groups SET search_vector = 
  to_tsvector('simple', COALESCE(name, '') || ' ' || COALESCE(description, ''));

-- Create trigger function for users
CREATE OR REPLACE FUNCTION users_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', 
    COALESCE(NEW.first_name, '') || ' ' || 
    COALESCE(NEW.last_name, '') || ' ' || 
    COALESCE(NEW.email, '') || ' ' || 
    COALESCE(NEW.display_name, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users
DROP TRIGGER IF EXISTS users_search_vector_trigger ON users;
CREATE TRIGGER users_search_vector_trigger
  BEFORE INSERT OR UPDATE OF first_name, last_name, email, display_name
  ON users
  FOR EACH ROW
  EXECUTE FUNCTION users_search_vector_update();

-- Create trigger function for groups
CREATE OR REPLACE FUNCTION groups_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', 
    COALESCE(NEW.name, '') || ' ' || 
    COALESCE(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for groups
DROP TRIGGER IF EXISTS groups_search_vector_trigger ON groups;
CREATE TRIGGER groups_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, description
  ON groups
  FOR EACH ROW
  EXECUTE FUNCTION groups_search_vector_update();
