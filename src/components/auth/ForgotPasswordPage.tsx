import { useState, type FormEvent } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import AuthLayout from './AuthLayout';
import './ForgotPasswordPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent you a password reset link"
      >
        <div className="success-message">
          <div className="success-icon">
            <CheckCircle size={64} />
          </div>
          <p className="success-text">
            We've sent a password reset link to <strong>{email}</strong>. 
            Please check your inbox and follow the instructions to reset your password.
          </p>
          <p className="success-note">
            Didn't receive the email? Check your spam folder or{' '}
            <button 
              type="button"
              className="resend-link"
              onClick={() => setIsSubmitted(false)}
            >
              try again
            </button>
          </p>
          <a href="/login" className="back-to-login">
            <ArrowLeft size={20} />
            Back to Sign In
          </a>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="No worries, we'll send you reset instructions"
    >
      <form className="forgot-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <p className="form-help">
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </p>
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? (
            <span className="loading-spinner"></span>
          ) : (
            <>
              Send Reset Link
              <ArrowRight size={20} />
            </>
          )}
        </button>

        <a href="/login" className="back-link">
          <ArrowLeft size={20} />
          Back to Sign In
        </a>
      </form>
    </AuthLayout>
  );
}