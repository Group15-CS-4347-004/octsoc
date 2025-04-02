const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql2');

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'octuser',
  password: 'octpassword',
  database: 'octsoc'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to MariaDB database');
  }
});

const dbPromise = db.promise();

app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await dbPromise.query('SELECT * FROM customers');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, membership_level } = req.body;
    const [result] = await dbPromise.query(
      'INSERT INTO customers (name, membership_level) VALUES (?, ?)',
      [name, membership_level]
    );
    res.status(201).json({ customer_id: result.insertId, name, membership_level });
  } catch (err) {
    console.error('Error adding customer:', err);
    res.status(500).json({ error: 'Failed to add customer' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await dbPromise.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, price, department_id } = req.body;
    const [result] = await dbPromise.query(
      'INSERT INTO products (name, price, department_id) VALUES (?, ?, ?)',
      [name, price, department_id]
    );
    res.status(201).json({ product_id: result.insertId, name, price, department_id });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

