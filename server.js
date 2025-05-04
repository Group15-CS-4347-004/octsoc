require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const mysql   = require('mysql2');

const app = express();

/* ---------------- BASIC MIDDLEWARE ---------------- */
app.use(
  cors({
    origin: ['http://localhost:5173',              // dev‑preview
             'https://group15-cs-4347-004.github.io',
             'https://octsoc.diejor.tech'],
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ---------------- DATABASE ---------------- */
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


/* ---------- 1. STORES + department count ---------- */
app.get('/api/stores', async (_, res) => {
  try {
    const [rows] = await dbp.query('SELECT * FROM store_with_dept_count');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------- 2. EMPLOYEES + manager ---------------- */
app.get('/api/employees', async (_, res) => {
  try {
    const [rows] = await dbp.query('SELECT * FROM employee_with_manager');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------- 3. SUPPLIER STATS --------------------- */
app.get('/api/suppliers', async (_, res) => {
  try {
    const [rows] = await dbp.query('SELECT * FROM supplier_stats');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------- 4. PRODUCTS EXPIRING SOON ------------- */
app.get('/api/products/expiring', async (_, res) => {
  try {
    const [rows] = await dbp.query('SELECT * FROM products_expiring_soon');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------- 5. DEPARTMENTS FOR ONE STORE ---------- */
app.get('/api/stores/:id/departments', async (req, res) => {
  try {
    const [rows] = await dbp.query(
      `SELECT d.department_number,d.name,
              CONCAT(e.first_name,' ',e.last_name) AS manager
       FROM department d
       LEFT JOIN employee e ON d.manager_id = e.employee_id
       WHERE d.store_number = ?`,
      [req.params.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------- 6. DAILY SALES (last 30 days) --------- */
app.get('/api/sales/daily', async (_, res) => {
  try {
    const [rows] = await dbp.query('SELECT * FROM daily_sales');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ——— CUSTOMER ——— */
app.get('/api/customer', async (_, res) => {
  try {
    const [rows] = await dbp.query(
      `SELECT membership_id,first_name,middle_initial,last_name,membership_type
       FROM customer`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/customer', async (req, res) => {
  const { first_name, middle_initial = null, last_name, membership_type = null } = req.body;
  try {
    const [result] = await dbp.query(
      `INSERT INTO customer(first_name,middle_initial,last_name,membership_type)
       VALUES (?,?,?,?)`,
      [first_name, middle_initial, last_name, membership_type]
    );
    res.status(201).json({ membership_id: result.insertId, first_name, middle_initial, last_name, membership_type });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ——— PRODUCT ——— */
app.get('/api/product', async (_, res) => {
  try {
    const [rows] = await dbp.query(
      `SELECT product_id,name,msrp,sell_by AS sell_by_date,supplier_id,department_number
       FROM product`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/product', async (req, res) => {
  const { name, msrp, sell_by_date = null, supplier_id, department_number } = req.body;
  try {
    const [result] = await dbp.query(
      `INSERT INTO product(name,msrp,sell_by,supplier_id,department_number)
       VALUES (?,?,?,?,?)`,
      [name, msrp, sell_by_date, supplier_id, department_number]
    );
    res.status(201).json({ product_id: result.insertId, name, msrp, sell_by_date, supplier_id, department_number });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------------- START SERVER ------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀  API ready → http://localhost:${PORT}`));

