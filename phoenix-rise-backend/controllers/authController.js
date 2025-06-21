// controllers/authController.js
const db = require('../db');
const bcrypt = require('bcrypt');

// Signup Logic
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  // Check for empty fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if email already exists
    const [existing] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Account already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    await db.promise().query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

// Login Logic
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const [user] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Check password
    const match = await bcrypt.compare(password, user[0].password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    res.status(200).json({ message: 'Login successful', name: user[0].name });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = { signup, login };
