-- Migration: Add password_hash column to users table
-- Description: Enables password-based authentication

ALTER TABLE users
ADD COLUMN password_hash TEXT DEFAULT NULL;

-- Add a comment to document the column
COMMENT ON COLUMN users.password_hash IS 'Bcryptjs hashed password for user authentication';
