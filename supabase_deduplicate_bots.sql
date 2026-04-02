-- Deduplication Cleanup Script for Bots Table
-- Purpose: Remove redundant stores created by multiple bookmarklet runs, keeping only the latest entry per store name.

DELETE FROM bots
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY owner_line_id, store_name 
                   ORDER BY created_at DESC, id DESC
               ) as row_num
        FROM bots
        WHERE owner_line_id IS NOT NULL 
          AND store_name IS NOT NULL
    ) t
    WHERE t.row_num > 1
);

-- Optional: Ensure absolute data integrity by adding a unique constraint if needed
-- WARNING: This may cause future bookmarklet runs to fail if the API logic isn't updated (I have already updated it).
-- ALTER TABLE bots ADD CONSTRAINT unique_owner_bot_name UNIQUE (owner_line_id, store_name);
