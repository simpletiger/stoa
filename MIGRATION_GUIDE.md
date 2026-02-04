# Database Migration Guide

## Apply the file_changes Table Migration

Since we're using Supabase cloud, apply the migration manually through the SQL editor.

### Steps:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your Stoa project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Run the Migration**
   - Open `supabase/migrations/20260203_file_changes.sql`
   - Copy the entire contents
   - Paste into SQL editor
   - Click "Run" or press Cmd/Ctrl + Enter

4. **Verify Table Creation**
   - Go to "Table Editor" in the left sidebar
   - Look for `file_changes` table
   - Verify columns: id, file_path, file_type, changed_by, changed_at, created_at

### Migration SQL (for reference)

```sql
-- Create file_changes table to track when files are modified via Stoa
CREATE TABLE IF NOT EXISTS file_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  file_type TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_file_changes_changed_at ON file_changes(changed_at DESC);
CREATE INDEX idx_file_changes_file_type ON file_changes(file_type);
CREATE INDEX idx_file_changes_changed_by ON file_changes(changed_by);

-- Enable RLS
ALTER TABLE file_changes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view file changes"
  ON file_changes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert file changes"
  ON file_changes FOR INSERT TO authenticated
  WITH CHECK (changed_by = auth.uid());
```

## Troubleshooting

### Error: "relation already exists"
If the table already exists, that's fine. The `CREATE TABLE IF NOT EXISTS` will skip it.

### Error: "index already exists"
Drop the existing index first:
```sql
DROP INDEX IF EXISTS idx_file_changes_changed_at;
DROP INDEX IF EXISTS idx_file_changes_file_type;
DROP INDEX IF EXISTS idx_file_changes_changed_by;
```
Then re-run the index creation commands.

### Error: "policy already exists"
Drop existing policies first:
```sql
DROP POLICY IF EXISTS "Users can view file changes" ON file_changes;
DROP POLICY IF EXISTS "Users can insert file changes" ON file_changes;
```
Then re-run the policy creation commands.

## Verify Installation

Run this query to test:
```sql
SELECT * FROM file_changes LIMIT 10;
```

Should return an empty result set (or existing records if already in use).

## Next Steps

After applying the migration:
1. Restart the Next.js dev server (if running)
2. Test file editing in Soul or Agents tabs
3. Verify changes appear in `file_changes` table
4. Marcus can now query this table to track file modifications
