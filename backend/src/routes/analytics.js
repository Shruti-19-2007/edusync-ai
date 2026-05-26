import express from 'express';
import { db } from '../data/store.js';

const router = express.Router();

router.get('/dashboard', (req, res) => {
  const totalStudents = db.students.length;
  const totalTeachers = db.users.filter(u => u.role === 'teacher').length;
  const totalParents = db.users.filter(u => u.role === 'parent').length;
  const pendingMeetings = db.ptmMeetings.filter(m => m.status === 'scheduled').length;
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = db.attendance.filter(a => a.date === today);
  const todayPresent = todayAttendance.filter(a => a.status === 'present').length;
  const activeHomework = db.homework.filter(h => new Date(h.deadline) >= new Date(today)).length;
  const unreadNotifications = db.notifications.filter(n => !n.read).length;

  const classBreakdown = ['9A', '9B', '10A', '10B'].map(cls => {
    const classStudents = db.students.filter(s => s.class === cls);
    const classAttendance = db.attendance.filter(a => classStudents.some(s => s.id === a.studentId));
    const present = classAttendance.filter(a => a.status === 'present').length;
    const total = classAttendance.length;
    return { class: cls, students: classStudents.length, attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0 };
  });

  const subjectPerformance = ['math', 'science', 'english', 'history'].map(subject => {
    const scores = db.students.map(s => s.marks[subject] || 0);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return { subject: subject.charAt(0).toUpperCase() + subject.slice(1), average: avg };
  });

  res.json({
    totalStudents,
    totalTeachers,
    totalParents,
    pendingMeetings,
    todayPresent,
    todayTotal: totalStudents,
    activeHomework,
    unreadNotifications,
    classBreakdown,
    subjectPerformance,
  });
});

export default router;
