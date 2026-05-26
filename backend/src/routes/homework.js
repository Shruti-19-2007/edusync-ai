import express from 'express';
import { db } from '../data/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { class: cls, teacherId, subject } = req.query;
  let result = db.homework;
  if (cls) result = result.filter(h => h.class === cls);
  if (teacherId) result = result.filter(h => h.teacherId === teacherId);
  if (subject) result = result.filter(h => h.subject === subject);
  const enriched = result.map(h => {
    const teacher = db.users.find(u => u.id === h.teacherId);
    return { ...h, teacherName: teacher?.name };
  });
  res.json(enriched);
});

router.get('/:id', (req, res) => {
  const hw = db.homework.find(h => h.id === req.params.id);
  if (!hw) return res.status(404).json({ error: 'Homework not found' });
  res.json(hw);
});

router.post('/', (req, res) => {
  const { title, subject, deadline, class: cls, teacherId, description } = req.body;
  if (!title || !subject || !deadline || !cls) {
    return res.status(400).json({ error: 'title, subject, deadline, class required' });
  }
  const hw = { id: db.uuidv4(), title, subject, deadline, class: cls, teacherId: teacherId || null, description: description || '', submissions: [] };
  db.homework.push(hw);
  res.status(201).json(hw);
});

router.put('/:id', (req, res) => {
  const idx = db.homework.findIndex(h => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Homework not found' });
  db.homework[idx] = { ...db.homework[idx], ...req.body };
  res.json(db.homework[idx]);
});

router.delete('/:id', (req, res) => {
  const idx = db.homework.findIndex(h => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Homework not found' });
  db.homework.splice(idx, 1);
  res.json({ success: true });
});

router.post('/:id/submit', (req, res) => {
  const { studentId } = req.body;
  const hw = db.homework.find(h => h.id === req.params.id);
  if (!hw) return res.status(404).json({ error: 'Homework not found' });
  if (!hw.submissions.includes(studentId)) hw.submissions.push(studentId);
  res.json(hw);
});

export default router;
