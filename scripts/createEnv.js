const fs = require('fs');
const path = require('path');

const envContent = `# Astra DB Configuration
ASTRA_DB_SECURE_BUNDLE_PATH="path/to/your/secure-connect-database.zip"
ASTRA_DB_CLIENT_ID="your-client-id"
ASTRA_DB_CLIENT_SECRET="your-client-secret"
ASTRA_DB_KEYSPACE="your-keyspace"

# JWT Configuration
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="24h"

# Server Configuration
PORT=3000
NODE_ENV="development"`;

const envPath = path.join(process.cwd(), '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('.env file created successfully!');
  console.log('\nIMPORTANT: Please update the following values in your .env file:');
  console.log('1. ASTRA_DB_SECURE_BUNDLE_PATH - Path to your secure connect bundle');
  console.log('2. ASTRA_DB_CLIENT_ID - Your Astra DB client ID');
  console.log('3. ASTRA_DB_CLIENT_SECRET - Your Astra DB client secret');
  console.log('4. ASTRA_DB_KEYSPACE - Your Astra DB keyspace name');
  console.log('5. JWT_SECRET - A secure random string for JWT signing');
} catch (error) {
  console.error('Error creating .env file:', error);
  process.exit(1);
} 