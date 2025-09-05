// Simple Node.js/Express authentication backend
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const users = [];
const JWT_SECRET = 'smartkrishi_secret_key';

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });
  if (users.find(u => u.email === email)) return res.status(409).json({ message: 'User already exists.' });
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword });
  res.json({ message: 'Registration successful.' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ message: 'Login successful.', token });
});

// Auth check endpoint
app.get('/api/profile', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token provided.' });
  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    res.json({ email: decoded.email });
  } catch {
    res.status(401).json({ message: 'Invalid token.' });
  }
});

module.exports = app;

// To run: node auth.js (after adding to your Express server)
