import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import AuthPage from './components/auth/AuthPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import Dashboard from './components/dashboard/Dashboard';
import './App.css';

function ProtectedRoute({ children }: { children: ReactNode }) {
  return sessionStorage.getItem('northstar-demo-user') ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;
