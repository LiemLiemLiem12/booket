const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL database.');

  try {
    console.log('Deleting all payment transactions...');
    await client.query('DELETE FROM "PAYMENT_TRANSACTIONS";');

    console.log('Deleting all orders...');
    await client.query('DELETE FROM "ORDERS";');

    console.log('Resetting all tickets to AVAILABLE status...');
    await client.query("UPDATE \"TICKETS\" SET status = 'AVAILABLE';");

    console.log('Database cleanup completed successfully.');
  } catch (error) {
    console.error('Error during database cleanup:', error);
  } finally {
    await client.end();
  }
}

main();
