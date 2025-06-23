const { Client, types } = require('cassandra-driver');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  const client = new Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'indiaseller4',
  });

  try {
    await client.connect();
    console.log('Connected to Cassandra');

    // Check if admin already exists
    const checkQuery = 'SELECT email FROM admin_users WHERE email = ? ALLOW FILTERING';
    const checkResult = await client.execute(checkQuery, ['admin@indiaseller.com'], { prepare: true });

    if (checkResult.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insert default admin user
    const query = 'INSERT INTO admin_users (user_id, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [
      types.Uuid.random(),
      'admin@indiaseller.com',
      hashedPassword,
      'admin',
      new Date(),
      new Date(),
    ];

    await client.execute(query, params, { prepare: true });
    console.log('Default admin user created successfully');
    console.log('Email: admin@indiaseller.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await client.shutdown();
  }
}

seedAdmin(); 