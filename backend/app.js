const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',               // Change if needed
  password: 'Goku#ssj3',  // 🔁 Your actual MySQL password
  database: 'phoenix_rise'
});

db.connect(err => {
  if (err) {
    console.error('❌ DB connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL DB');
  }
});

// ✅ Registration Route
app.post('/api/register', (req, res) => {
  const { name, email, phone, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, email, phone, hashedPassword], (err) => {
      if (err) return res.status(500).json({ message: 'Registration failed' });
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

// ✅ Login Route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, 'jwt_secret', {
      expiresIn: '1d'
    });

    res.status(200).json({ message: 'Login successful', token });
  });
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
