const { Client } = require('cassandra-driver');

async function updateAdminTable() {
  const client = new Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'indiaseller4',
  });

  try {
    await client.connect();
    console.log('Connected to Cassandra');

    // Drop the existing admin_users table
    await client.execute('DROP TABLE IF EXISTS admin_users');
    console.log('Dropped admin_users table');

    // Create the admin_users table with password_hash
    const createTable = `
      CREATE TABLE IF NOT EXISTS admin_users (
        user_id uuid PRIMARY KEY,
        email text,
        password_hash text,
        role text,
        created_at timestamp,
        updated_at timestamp
      )
    `;
    await client.execute(createTable);
    console.log('Created admin_users table with password_hash');

    // Create index on email
    const createIndex = 'CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users (email)';
    await client.execute(createIndex);
    console.log('Created email index');

  } catch (error) {
    console.error('Error updating admin table:', error);
  } finally {
    await client.shutdown();
  }
}

updateAdminTable(); 