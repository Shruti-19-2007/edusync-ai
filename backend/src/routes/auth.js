import express from 'express';
import { db } from '../data/store.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

router.get('/users', (req, res) => {
  res.json(db.users.map(({ password: _, ...u }) => u));
});

router.post('/users', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields required' });
  }
  const exists = db.users.find(u => u.email === email);
  if (exists) return res.status(409).json({ error: 'Email already exists' });
  const user = { id: db.uuidv4(), name, email, password, role };
  db.users.push(user);
  const { password: _, ...safeUser } = user;
  res.status(201).json(safeUser);
});

export default router;
