-- v6: usernames. Display name chosen at signup. Unique (NULLs allowed for
-- legacy accounts, which get prompted to choose one on next sign-in).
ALTER TABLE users ADD COLUMN username TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
