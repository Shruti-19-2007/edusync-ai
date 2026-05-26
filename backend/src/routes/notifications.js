import express from 'express';
import { db } from '../data/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { role } = req.query;
  let result = db.notifications;
  if (role) result = result.filter(n => n.targetRole === role || n.targetRole === 'all');
  res.json(result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post('/', (req, res) => {
  const { title, message, type, targetRole } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'title and message required' });
  const notif = { id: db.uuidv4(), title, message, type: type || 'info', targetRole: targetRole || 'all', createdAt: new Date().toISOString(), read: false };
  db.notifications.push(notif);
  res.status(201).json(notif);
});

router.put('/:id/read', (req, res) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });
  notif.read = true;
  res.json(notif);
});

export default router;
