const fs = require('fs');
const path = require('path');

const envContent = `# Astra DB Configuration
ASTRA_DB_SECURE_BUNDLE_PATH=path/to/your/secure-connect-database.zip
ASTRA_DB_CLIENT_ID=your_client_id
ASTRA_DB_CLIENT_SECRET=your_client_secret
ASTRA_DB_KEYSPACE=indiaseller4

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_this_in_production

# Next Auth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key_change_this_in_production
NEXTAUTH_URL=http://localhost:3000`;

const envPath = path.join(process.cwd(), '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('.env file created successfully!');
  console.log('\nIMPORTANT: Please update the following values in your .env file:');
  console.log('1. ASTRA_DB_SECURE_BUNDLE_PATH - Path to your secure connect bundle');
  console.log('2. ASTRA_DB_CLIENT_ID - Your Astra DB client ID');
  console.log('3. ASTRA_DB_CLIENT_SECRET - Your Astra DB client secret');
} catch (error) {
  console.error('Error creating .env file:', error);
} 