import { useState, type ReactNode } from 'react';
import { Moon, Sun, Globe } from 'lucide-react';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
  };

  return (
    <div className={`auth-container ${isDarkMode ? 'dark' : ''}`}>
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="auth-header">
        <div className="logo">
          <Globe className="logo-icon" />
          <span className="logo-text">ERP Pro</span>
        </div>
        <button className="theme-toggle" onClick={toggleDarkMode} aria-label="Toggle dark mode">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="auth-content">
        <div className="auth-text">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>
        <div className="auth-card">
          {children}
        </div>
      </div>

      <div className="auth-footer">
        <p>© 2025 ERP Pro. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#support">Support</a>
        </div>
      </div>
    </div>
  );
}