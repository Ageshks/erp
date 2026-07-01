import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './components/auth/AuthPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;