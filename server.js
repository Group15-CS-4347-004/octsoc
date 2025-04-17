require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const mysql   = require('mysql2');

const app = express();

app.use(cors({ origin: 'https://group15-cs-4347-004.github.io' }));
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
  console.log('Connected to MariaDB');
});
const dbp = db.promise();

// ——— CUSTOMER ———
app.get('/api/customer', async (_, res) => {
  try {
    const [rows] = await dbp.query(
      `SELECT
         membership_id,
         first_name,
         middle_initial,
         last_name,
         membership_type
       FROM customer`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch customer list' });
  }
});

app.post('/api/customer', async (req, res) => {
  const {
    first_name,
    middle_initial = null,
    last_name,
    membership_type = null
  } = req.body;
  try {
    const [result] = await dbp.query(
      `INSERT INTO customer
         (first_name, middle_initial, last_name, membership_type)
       VALUES (?, ?, ?, ?)`,
      [first_name, middle_initial, last_name, membership_type]
    );
    res.status(201).json({
      membership_id:    result.insertId,
      first_name,
      middle_initial,
      last_name,
      membership_type
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to add customer' });
  }
});

// ——— PRODUCT ———
app.get('/api/product', async (_, res) => {
  try {
    const [rows] = await dbp.query(
      `SELECT
         product_id,
         name,
         msrp,
         sell_by_date,
         supplier_id,
         department_number
       FROM product`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch product list' });
  }
});

app.post('/api/product', async (req, res) => {
  const {
    name,
    msrp,
    sell_by_date = null,
    supplier_id,
    department_number
  } = req.body;
  try {
    const [result] = await dbp.query(
      `INSERT INTO product
         (name, msrp, sell_by_date, supplier_id, department_number)
       VALUES (?, ?, ?, ?, ?)`,
      [name, msrp, sell_by_date, supplier_id, department_number]
    );
    res.status(201).json({
      product_id:        result.insertId,
      name,
      msrp,
      sell_by_date,
      supplier_id,
      department_number
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// ——— START SERVER ———
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

