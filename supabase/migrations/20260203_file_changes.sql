-- Create file_changes table to track when files are modified via Stoa
CREATE TABLE IF NOT EXISTS file_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  file_type TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_file_changes_changed_at ON file_changes(changed_at DESC);
CREATE INDEX idx_file_changes_file_type ON file_changes(file_type);
CREATE INDEX idx_file_changes_changed_by ON file_changes(changed_by);

-- Enable RLS
ALTER TABLE file_changes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all file changes
CREATE POLICY "Users can view file changes"
  ON file_changes
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can insert their own file changes
CREATE POLICY "Users can insert file changes"
  ON file_changes
  FOR INSERT
  TO authenticated
  WITH CHECK (changed_by = auth.uid());
