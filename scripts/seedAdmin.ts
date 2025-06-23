import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getClient, connectClient } from '../cassandra/cassandraClient';

async function seedAdmin() {
  try {
    // Connect to Cassandra
    await connectClient();
    const client = getClient();

    // Admin user details
    const adminUser = {
      user_id: uuidv4(),
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Check if admin already exists
    const checkQuery = 'SELECT email FROM admin_users WHERE email = ? ALLOW FILTERING';
    const result = await client.execute(checkQuery, [adminUser.email], { prepare: true });

    if (result.rows.length > 0) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Insert admin user
    const insertQuery = `
      INSERT INTO admin_users (
        user_id, email, password, role, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      adminUser.user_id,
      adminUser.email,
      adminUser.password,
      adminUser.role,
      adminUser.created_at,
      adminUser.updated_at
    ];

    await client.execute(insertQuery, params, { prepare: true });
    console.log('Admin user created successfully');
    console.log('Email:', adminUser.email);
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedAdmin(); 