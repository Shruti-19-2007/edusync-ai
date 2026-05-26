import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import HomeworkPage from './pages/HomeworkPage.jsx';
import PTMPage from './pages/PTMPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="homework" element={<HomeworkPage />} />
        <Route path="ptm" element={<PTMPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
