import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSDKContext } from '../hooks/useSDKContext';
import { triggerRegister } from '../services/apiService';
import { registerUser } from '../db/userStore';
import StatusBadge from '../components/StatusBadge';
import { ApiStatus } from '../types';
import styles from './SignUp.module.css';

export default function SignUp() {
  useSDKContext('signup_screen');

  const { startSession, completeAuth } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw]                   = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [apiStatus, setApiStatus]             = useState<ApiStatus>({ status: 'idle', message: '' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setApiStatus({ status: 'error', message: 'Passwords do not match.' });
      return;
    }

    const reg = registerUser(email.trim(), password);
    if (!reg.ok) {
      setApiStatus({ status: 'error', message: reg.error });
      return;
    }

    const csid = startSession();
    setApiStatus({ status: 'loading', message: 'Creating your account…' });

    try {
      await triggerRegister(csid, email.trim());
      completeAuth({ email: email.trim(), isNewUser: true });
      setApiStatus({ status: 'success', message: 'Account created! Redirecting…' });
      setTimeout(() => navigate('/account'), 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setApiStatus({ status: 'error', message: `Registration failed: ${message}` });
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Create Account</h2>
        <p className={styles.sub}>Open your SecureBank account in seconds.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            placeholder=""
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <label className={styles.label}>Password</label>
          <div className={styles.pwWrap}>
            <input
              className={styles.pwInput}
              type={showPw ? 'text' : 'password'}
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button type="button" className={styles.pwToggle} onClick={() => setShowPw(v => !v)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          <label className={styles.label}>Confirm Password</label>
          <div className={styles.pwWrap}>
            <input
              className={styles.pwInput}
              type={showConfirm ? 'text' : 'password'}
              placeholder=""
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button type="button" className={styles.pwToggle} onClick={() => setShowConfirm(v => !v)}>
              {showConfirm ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            type="submit"
            className={styles.btn}
            style={{
              opacity: apiStatus.status === 'loading' ? 0.7 : 1,
              cursor:  apiStatus.status === 'loading' ? 'not-allowed' : 'pointer',
            }}
            disabled={apiStatus.status === 'loading'}
          >
            {apiStatus.status === 'loading' ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <StatusBadge status={apiStatus.status} message={apiStatus.message} />

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
