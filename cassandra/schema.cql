-- Create keyspace
CREATE KEYSPACE IF NOT EXISTS indiaseller4
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

-- Use keyspace
USE indiaseller4;

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY,
  email text,
  password text,
  role text,
  created_at timestamp,
  updated_at timestamp
);

-- Create index on email for login queries
CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users (email); 