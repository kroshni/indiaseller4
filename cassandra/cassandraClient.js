require('dotenv').config();
const { Client } = require('cassandra-driver');

let client = null;

async function getClient() {
  if (client) return client;

  client = new Client({
    cloud: {
      secureConnectBundle: process.env.ASTRA_DB_SECURE_BUNDLE_PATH
    },
    credentials: {
      username: process.env.ASTRA_DB_CLIENT_ID,
      password: process.env.ASTRA_DB_CLIENT_SECRET
    },
    keyspace: process.env.ASTRA_DB_KEYSPACE
  });

  await client.connect();
  return client;
}

module.exports = {
  getClient
}; 