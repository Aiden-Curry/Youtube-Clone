/*
  # Update comments table and add audit log

  1. Changes to `users` table
    - Add `is_admin` (boolean, default false)
  
  2. Changes to `comments` table
    - Add `deleted_at` (timestamptz) for soft deletes
    - Add `edited_at` (timestamptz) for edit tracking
    - Add index on deleted_at
  
  3. Changes to `reports` table
    - Add `status` (text, default 'pending') for tracking review state
    - Add `reviewed_by` (uuid, foreign key to users)
    - Add `reviewed_at` (timestamptz)
    - Add `action_taken` (text)
  
  4. New Tables
    - `audit_logs`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, foreign key to users)
      - `action` (text)
      - `target_type` (text) - video, comment, user
      - `target_id` (uuid)
      - `details` (jsonb)
      - `created_at` (timestamptz)

  5. Security
    - Enable RLS on audit_logs
    - Add policies for admin access
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE comments ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'edited_at'
  ) THEN
    ALTER TABLE comments ADD COLUMN edited_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'status'
  ) THEN
    ALTER TABLE reports ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE reports ADD COLUMN reviewed_by UUID REFERENCES users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE reports ADD COLUMN reviewed_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'action_taken'
  ) THEN
    ALTER TABLE reports ADD COLUMN action_taken TEXT;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Only admins can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
