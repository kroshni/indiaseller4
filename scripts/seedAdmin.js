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

    // Hash the default password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insert default admin user
    const query = 'INSERT INTO admin_users (user_id, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)';
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
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await client.shutdown();
  }
}

seedAdmin(); 