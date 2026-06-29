-- v5: add a human-readable title to spend_log so the profile can show
-- a readable "previous requests" history (existing rows stay NULL → "Untitled").
ALTER TABLE spend_log ADD COLUMN title TEXT;
