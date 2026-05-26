import express from 'express';
import { db } from '../data/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { studentId, date, class: cls } = req.query;
  let result = db.attendance;
  if (studentId) result = result.filter(a => a.studentId === studentId);
  if (date) result = result.filter(a => a.date === date);
  if (cls) {
    const classStudentIds = db.students.filter(s => s.class === cls).map(s => s.id);
    result = result.filter(a => classStudentIds.includes(a.studentId));
  }
  const enriched = result.map(a => {
    const student = db.students.find(s => s.id === a.studentId);
    return { ...a, studentName: student?.studentName, class: student?.class };
  });
  res.json(enriched);
});

router.post('/', (req, res) => {
  const records = Array.isArray(req.body) ? req.body : [req.body];
  const created = [];
  for (const record of records) {
    const { studentId, date, status } = record;
    if (!studentId || !date || !status) continue;
    const existing = db.attendance.find(a => a.studentId === studentId && a.date === date);
    if (existing) {
      existing.status = status;
      created.push(existing);
    } else {
      const entry = { id: db.uuidv4(), studentId, date, status };
      db.attendance.push(entry);
      created.push(entry);
    }
  }
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const idx = db.attendance.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Attendance record not found' });
  db.attendance[idx] = { ...db.attendance[idx], ...req.body };
  res.json(db.attendance[idx]);
});

router.get('/summary', (req, res) => {
  const summary = db.students.map(student => {
    const records = db.attendance.filter(a => a.studentId === student.id);
    const present = records.filter(a => a.status === 'present').length;
    const total = records.length;
    return {
      studentId: student.id,
      studentName: student.studentName,
      class: student.class,
      present,
      absent: total - present,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  });
  res.json(summary);
});

export default router;
