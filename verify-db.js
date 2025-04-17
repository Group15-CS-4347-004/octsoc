require('dotenv').config();            // loads DB_HOST, DB_USER, etc.
const mysql = require('mysql2/promise');

const REQUIRED_TABLES = [
  'store',
  'department',
  'employee',
  'supplier',
  'product',
  'customer',
  'inventory',
  'sales_transaction',
  'sales_transaction_details',
  'shipment',
  'shipment_details'
];

(async () => {
  let allGood = true;

  // 1) Connect
  let conn;
  try {
    conn = await mysql.createConnection({
      host:     process.env.DB_HOST,
      user:     process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port:     process.env.DB_PORT,
    });
    console.log('✅ Connected to database');
  } catch (e) {
    console.error('❌ Failed to connect to database:', e.message);
    process.exit(1);
  }

  // 2) Check each table exists and report row count
  for (const tbl of REQUIRED_TABLES) {
    try {
      const [exists] = await conn.query("SHOW TABLES LIKE ?", [tbl]);
      if (exists.length === 0) {
        console.error(`❌ Table missing: ${tbl}`);
        allGood = false;
        continue;
      }
      console.log(`✅ Table exists: ${tbl}`);

      // sanity‐check: count rows
      const [[{ cnt }]] = await conn.query(`SELECT COUNT(*) AS cnt FROM \`${tbl}\``);
      console.log(`   → ${tbl} has ${cnt} row(s)`);
    } catch (e) {
      console.error(`❌ Error checking table ${tbl}:`, e.message);
      allGood = false;
    }
  }

  await conn.end();

  if (!allGood) {
    console.error('\n🔴 Database verification FAILED');
    process.exit(1);
  } else {
    console.log('\n🟢 Database verification PASSED');
    process.exit(0);
  }
})();

