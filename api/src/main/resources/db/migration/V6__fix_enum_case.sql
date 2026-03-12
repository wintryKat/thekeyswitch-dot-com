-- Fix enum values to match GraphQL enum cases (uppercase)
UPDATE switches SET type = UPPER(type);
UPDATE posts SET status = UPPER(status);
UPDATE posts SET author_type = UPPER(author_type);
