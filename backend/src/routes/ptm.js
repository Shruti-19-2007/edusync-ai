import express from 'express';
import { db } from '../data/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { teacherId, parentId, status } = req.query;
  let result = db.ptmMeetings;
  if (teacherId) result = result.filter(m => m.teacherId === teacherId);
  if (parentId) result = result.filter(m => m.parentId === parentId);
  if (status) result = result.filter(m => m.status === status);
  const enriched = result.map(m => {
    const teacher = db.users.find(u => u.id === m.teacherId);
    const parent = db.users.find(u => u.id === m.parentId);
    const student = db.students.find(s => s.id === m.studentId);
    return { ...m, teacherName: teacher?.name, parentName: parent?.name, studentName: student?.studentName };
  });
  res.json(enriched);
});

router.post('/', (req, res) => {
  const { teacherId, parentId, studentId, meetingDate, meetingTime, notes } = req.body;
  if (!teacherId || !parentId || !meetingDate || !meetingTime) {
    return res.status(400).json({ error: 'teacherId, parentId, meetingDate, meetingTime required' });
  }
  const conflict = db.ptmMeetings.find(m => m.teacherId === teacherId && m.meetingDate === meetingDate && m.meetingTime === meetingTime && m.status !== 'cancelled');
  if (conflict) return res.status(409).json({ error: 'Time slot already booked' });
  const meeting = { id: db.uuidv4(), teacherId, parentId, studentId: studentId || null, meetingDate, meetingTime, status: 'scheduled', notes: notes || '' };
  db.ptmMeetings.push(meeting);
  res.status(201).json(meeting);
});

router.put('/:id', (req, res) => {
  const idx = db.ptmMeetings.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Meeting not found' });
  db.ptmMeetings[idx] = { ...db.ptmMeetings[idx], ...req.body };
  res.json(db.ptmMeetings[idx]);
});

router.delete('/:id', (req, res) => {
  const idx = db.ptmMeetings.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Meeting not found' });
  db.ptmMeetings[idx].status = 'cancelled';
  res.json(db.ptmMeetings[idx]);
});

export default router;
