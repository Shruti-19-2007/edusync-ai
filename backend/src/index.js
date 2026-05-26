import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import studentsRouter from './routes/students.js';
import attendanceRouter from './routes/attendance.js';
import ptmRouter from './routes/ptm.js';
import homeworkRouter from './routes/homework.js';
import notificationsRouter from './routes/notifications.js';
import analyticsRouter from './routes/analytics.js';

const app = express();
const PORT = 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/ptm', ptmRouter);
app.use('/api/homework', homeworkRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`EduSync API running on http://localhost:${PORT}`);
});
