require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const mysql   = require('mysql2');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://group15-cs-4347-004.github.io',
    'https://octsoc.diejor.tech'
  ]
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT,
});
db.connect(err => {
  if (err) {
    console.error('DB connect error:', err.message);
    process.exit(1);
  }
  console.log('✅  Connected to MariaDB');
});
const dbp = db.promise();

// 1. STORES + department count (view name matches creation exactly)
app.get('/api/stores', async (_, res) => {
  try {
    const [rows] = await dbp.query('SELECT * FROM `store_with_dept_count`');
    res.json(rows);
  } catch (e) {
    console.error('[/api/stores] ERROR:', e);
    res.status(500).json({ error: e.message });
  }
});

// 2. EMPLOYEES + manager
app.get('/api/employees', async (_, res) => {
  try {
    const [rows] = await dbp.query('SELECT * FROM `employee_with_manager`');
    res.json(rows);
  } catch (e) {
    console.error('[/api/employees] ERROR:', e);
    res.status(500).json({ error: e.message });
  }
});

// 3. SUPPLIERS stats
app.get('/api/suppliers', async (_, res) => {
  try {
    const [rows] = await dbp.query('SELECT * FROM `supplier_stats`');
    res.json(rows);
  } catch (e) {
    console.error('[/api/suppliers] ERROR:', e);
    res.status(500).json({ error: e.message });
  }
});

// 4. EXPIRING products
app.get('/api/products/expiring', async (_, res) => {
  try {
    const [rows] = await dbp.query('SELECT * FROM `products_expiring_soon`');
    res.json(rows);
  } catch (e) {
    console.error('[/api/products/expiring] ERROR:', e);
    res.status(500).json({ error: e.message });
  }
});

// 5. DEPARTMENTS for one store
app.get('/api/stores/:id/departments', async (req, res) => {
  try {
    const [rows] = await dbp.query(
      `SELECT d.department_number,
              d.name,
              CONCAT(e.first_name,' ',e.last_name) AS manager
       FROM \`DEPARTMENT\` AS d
       LEFT JOIN \`EMPLOYEE\`   AS e
         ON d.manager_id = e.employee_id
       WHERE d.store_number = ?`,
      [req.params.id]
    );
    res.json(rows);
  } catch (e) {
    console.error('[/api/stores/:id/departments] ERROR:', e);
    res.status(500).json({ error: e.message });
  }
});

// CUSTOMER endpoints
app.get('/api/customer', async (_, res) => {
  try {
    const [rows] = await dbp.query(
      `SELECT membership_id,
              first_name,
              middle_initial,
              last_name,
              membership_type
       FROM \`CUSTOMER\``
    );
    res.json(rows);
  } catch (e) {
    console.error('[/api/customer GET] ERROR:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/customer', async (req, res) => {
  const { first_name, middle_initial=null, last_name, membership_type=null } = req.body;
  try {
    const [result] = await dbp.query(
      `INSERT INTO \`CUSTOMER\`(
         first_name, middle_initial, last_name, membership_type
       ) VALUES (?,?,?,?)`,
      [first_name, middle_initial, last_name, membership_type]
    );
    res.status(201).json({
      membership_id: result.insertId,
      first_name, middle_initial, last_name, membership_type
    });
  } catch (e) {
    console.error('[/api/customer POST] ERROR:', e);
    res.status(500).json({ error: e.message });
  }
});

// PRODUCT endpoints
app.get('/api/product', async (_, res) => {
  try {
    const [rows] = await dbp.query(
      `SELECT product_id,
              name,
              msrp,
              sell_by   AS sell_by_date,
              supplier_id,
              department_number
       FROM \`PRODUCT\``
    );
    res.json(rows);
  } catch (e) {
    console.error('[/api/product GET] ERROR:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/product', async (req, res) => {
  const { name, msrp, sell_by_date=null, supplier_id, department_number } = req.body;
  try {
    const [result] = await dbp.query(
      `INSERT INTO \`PRODUCT\`(
         name, msrp, sell_by, supplier_id, department_number
       ) VALUES (?,?,?,?,?)`,
      [name, msrp, sell_by_date, supplier_id, department_number]
    );
    res.status(201).json({
      product_id: result.insertId,
      name, msrp, sell_by_date, supplier_id, department_number
    });
  } catch (e) {
    console.error('[/api/product POST] ERROR:', e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀  API ready → http://localhost:${PORT}`));

