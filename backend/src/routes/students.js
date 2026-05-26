import express from 'express';
import { db } from '../data/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { class: cls, parentId } = req.query;
  let result = db.students;
  if (cls) result = result.filter(s => s.class === cls);
  if (parentId) result = result.filter(s => s.parentId === parentId);
  res.json(result);
});

router.get('/:id', (req, res) => {
  const student = db.students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

router.post('/', (req, res) => {
  const { studentName, class: cls, parentId, marks } = req.body;
  if (!studentName || !cls) return res.status(400).json({ error: 'studentName and class required' });
  const student = {
    id: db.uuidv4(),
    studentName,
    class: cls,
    parentId: parentId || null,
    marks: marks || { math: 0, science: 0, english: 0, history: 0 },
  };
  db.students.push(student);
  res.status(201).json(student);
});

router.put('/:id', (req, res) => {
  const idx = db.students.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });
  db.students[idx] = { ...db.students[idx], ...req.body };
  res.json(db.students[idx]);
});

router.delete('/:id', (req, res) => {
  const idx = db.students.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });
  db.students.splice(idx, 1);
  res.json({ success: true });
});

export default router;
