import type { ReactNode } from 'react';
import { Boxes } from 'lucide-react';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="auth-header">
        <div className="logo">
          <span className="auth-brand-mark"><Boxes size={22} /></span>
          <span className="logo-text">Northstar</span>
        </div>
        <span className="secure-label">Secure business workspace</span>
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
        <p>© 2026 Northstar. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#support">Support</a>
        </div>
      </div>
    </div>
  );
}
