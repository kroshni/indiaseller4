const fs = require('fs');
const path = require('path');

const envContent = `CASSANDRA_CONTACT_POINTS=127.0.0.1
CASSANDRA_LOCAL_DC=datacenter1
CASSANDRA_KEYSPACE=indiaseller4
JWT_SECRET=your_super_secret_key_change_this_in_production
NEXTAUTH_SECRET=your_nextauth_secret_key_change_this_in_production
NEXTAUTH_URL=http://localhost:3000`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('.env.local file created successfully!');
} catch (error) {
  console.error('Error creating .env.local file:', error);
} 