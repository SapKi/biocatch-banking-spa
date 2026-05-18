import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSDKContext } from '../hooks/useSDKContext';
import { triggerInit } from '../services/apiService';
import { loginUser } from '../db/userStore';
import StatusBadge from '../components/StatusBadge';
import { ApiStatus } from '../types';
import styles from './Login.module.css';

export default function Login() {
  useSDKContext('login_screen');

  const { startSession, completeAuth } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPw, setShowPw]             = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const [apiStatus, setApiStatus]       = useState<ApiStatus>({ status: 'idle', message: '' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    const result = loginUser(email.trim(), password);
    if (!result.ok) {
      setUserNotFound(result.error === 'Email not found.');
      setApiStatus({ status: 'error', message: result.error });
      return;
    }
    setUserNotFound(false);

    const csid = startSession();
    setApiStatus({ status: 'loading', message: 'Authenticating…' });

    try {
      await triggerInit(csid, email.trim());
      completeAuth({ email: email.trim(), isNewUser: false });
      setApiStatus({ status: 'success', message: 'Login successful! Redirecting…' });
      setTimeout(() => navigate('/account'), 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setApiStatus({ status: 'error', message: `Login failed: ${message}` });
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Sign In</h2>
        <p className={styles.sub}>Enter your credentials to access your account.</p>

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
              autoComplete="current-password"
            />
            <button type="button" className={styles.pwToggle} onClick={() => setShowPw(v => !v)}>
              {showPw ? 'Hide' : 'Show'}
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
            {apiStatus.status === 'loading' ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <StatusBadge status={apiStatus.status} message={apiStatus.message} />

        <p className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className={styles.link}
            style={userNotFound ? { fontWeight: 800, fontSize: '1rem', textDecoration: 'underline' } : undefined}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
