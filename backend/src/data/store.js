import { v4 as uuidv4 } from 'uuid';

const users = [
  { id: 'u1', name: 'Admin User', email: 'admin@edusync.com', password: 'admin123', role: 'admin' },
  { id: 'u2', name: 'Ms. Priya Sharma', email: 'teacher@edusync.com', password: 'teacher123', role: 'teacher' },
  { id: 'u3', name: 'Raj Patel', email: 'parent@edusync.com', password: 'parent123', role: 'parent' },
  { id: 'u4', name: 'Aarav Patel', email: 'student@edusync.com', password: 'student123', role: 'student' },
];

const students = [
  { id: 's1', studentName: 'Aarav Patel', class: '10A', parentId: 'u3', marks: { math: 88, science: 92, english: 78, history: 85 } },
  { id: 's2', studentName: 'Diya Sharma', class: '10A', parentId: 'u3', marks: { math: 95, science: 89, english: 91, history: 87 } },
  { id: 's3', studentName: 'Rohan Mehta', class: '10B', parentId: 'u3', marks: { math: 72, science: 68, english: 80, history: 75 } },
  { id: 's4', studentName: 'Ananya Singh', class: '9A', parentId: 'u3', marks: { math: 90, science: 95, english: 88, history: 92 } },
  { id: 's5', studentName: 'Karan Joshi', class: '9B', parentId: 'u3', marks: { math: 65, science: 70, english: 74, history: 68 } },
];

const attendance = [
  { id: 'a1', studentId: 's1', date: '2026-05-20', status: 'present' },
  { id: 'a2', studentId: 's1', date: '2026-05-21', status: 'present' },
  { id: 'a3', studentId: 's1', date: '2026-05-22', status: 'absent' },
  { id: 'a4', studentId: 's1', date: '2026-05-23', status: 'present' },
  { id: 'a5', studentId: 's1', date: '2026-05-26', status: 'present' },
  { id: 'a6', studentId: 's2', date: '2026-05-20', status: 'present' },
  { id: 'a7', studentId: 's2', date: '2026-05-21', status: 'present' },
  { id: 'a8', studentId: 's2', date: '2026-05-22', status: 'present' },
  { id: 'a9', studentId: 's2', date: '2026-05-23', status: 'present' },
  { id: 'a10', studentId: 's2', date: '2026-05-26', status: 'present' },
  { id: 'a11', studentId: 's3', date: '2026-05-20', status: 'absent' },
  { id: 'a12', studentId: 's3', date: '2026-05-21', status: 'present' },
  { id: 'a13', studentId: 's3', date: '2026-05-22', status: 'absent' },
  { id: 'a14', studentId: 's3', date: '2026-05-23', status: 'present' },
  { id: 'a15', studentId: 's3', date: '2026-05-26', status: 'present' },
  { id: 'a16', studentId: 's4', date: '2026-05-20', status: 'present' },
  { id: 'a17', studentId: 's4', date: '2026-05-21', status: 'present' },
  { id: 'a18', studentId: 's4', date: '2026-05-22', status: 'present' },
  { id: 'a19', studentId: 's4', date: '2026-05-23', status: 'absent' },
  { id: 'a20', studentId: 's4', date: '2026-05-26', status: 'present' },
  { id: 'a21', studentId: 's5', date: '2026-05-20', status: 'present' },
  { id: 'a22', studentId: 's5', date: '2026-05-21', status: 'absent' },
  { id: 'a23', studentId: 's5', date: '2026-05-22', status: 'present' },
  { id: 'a24', studentId: 's5', date: '2026-05-23', status: 'absent' },
  { id: 'a25', studentId: 's5', date: '2026-05-26', status: 'present' },
];

const ptmMeetings = [
  { id: 'p1', teacherId: 'u2', parentId: 'u3', studentId: 's1', meetingDate: '2026-06-05', meetingTime: '10:00', status: 'scheduled', notes: 'Discuss semester progress' },
  { id: 'p2', teacherId: 'u2', parentId: 'u3', studentId: 's2', meetingDate: '2026-06-05', meetingTime: '11:00', status: 'scheduled', notes: 'Academic excellence review' },
];

const homework = [
  { id: 'h1', title: 'Algebra Problem Set', subject: 'Math', deadline: '2026-05-28', class: '10A', teacherId: 'u2', description: 'Complete exercises 5.1 to 5.4 from textbook', submissions: ['s1', 's2'] },
  { id: 'h2', title: 'Essay: Climate Change', subject: 'English', deadline: '2026-05-30', class: '10A', teacherId: 'u2', description: 'Write a 500-word essay on the impacts of climate change', submissions: ['s2'] },
  { id: 'h3', title: 'Newton\'s Laws Lab Report', subject: 'Science', deadline: '2026-06-02', class: '10B', teacherId: 'u2', description: 'Document your lab experiment findings', submissions: [] },
  { id: 'h4', title: 'History Timeline Project', subject: 'History', deadline: '2026-06-04', class: '9A', teacherId: 'u2', description: 'Create a timeline of major world events 1900-2000', submissions: ['s4'] },
];

const notifications = [
  { id: 'n1', title: 'PTM Scheduled', message: 'Your PTM meeting is scheduled for June 5, 2026 at 10:00 AM', type: 'info', targetRole: 'parent', createdAt: '2026-05-25T10:00:00Z', read: false },
  { id: 'n2', title: 'Homework Due Tomorrow', message: 'Algebra Problem Set is due tomorrow, May 28', type: 'warning', targetRole: 'student', createdAt: '2026-05-27T08:00:00Z', read: false },
  { id: 'n3', title: 'Attendance Alert', message: 'Aarav Patel was absent on May 22, 2026', type: 'alert', targetRole: 'parent', createdAt: '2026-05-22T15:00:00Z', read: true },
  { id: 'n4', title: 'New Homework Posted', message: 'Ms. Sharma posted a new assignment: Essay on Climate Change', type: 'info', targetRole: 'student', createdAt: '2026-05-26T09:00:00Z', read: false },
];

export const db = {
  users,
  students,
  attendance,
  ptmMeetings,
  homework,
  notifications,
  uuidv4,
};
