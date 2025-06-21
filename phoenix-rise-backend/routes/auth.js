const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

// ✅ Sign Up Route
router.post('/signup', async (req, res) => {
  console.log("📩 Signup endpoint hit"); // This helps verify the route is being called

  const { name, email, password } = req.body;

  try {
    // Check if email already exists
    const [existing] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Account already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await db.promise().query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
   console.error("❌ Signup Error:", error); // full error object

    res.status(500).json({ message: "SignUp Failed. Try again later" });
  }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const [rows] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Email not found" });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ message: "Login Failed. Try again later" });
  }
});

module.exports = router;
