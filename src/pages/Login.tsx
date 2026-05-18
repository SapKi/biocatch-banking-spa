import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSDKContext } from '../hooks/useSDKContext';
import { triggerInit } from '../services/apiService';
import { loginUser } from '../db/userStore';
import { getErrorMessage } from '../utils/error';
import { SCREENS, ROUTES, REDIRECT_DELAY_MS } from '../config';
import StatusBadge from '../components/StatusBadge';
import { ApiStatus } from '../types';
import styles from '../styles/form.module.css';

export default function Login() {
  useSDKContext(SCREENS.LOGIN);

  const { startSession, completeAuth } = useAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ status: 'idle', message: '' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    const result = loginUser(email.trim(), password);
    if (!result.ok) {
      setApiStatus({ status: 'error', message: result.error });
      return;
    }

    const csid = startSession();
    setApiStatus({ status: 'loading', message: 'Authenticating…' });

    try {
      await triggerInit(csid, email.trim());
      if (!isMounted.current) return;
      completeAuth({ email: email.trim(), isNewUser: false });
      setApiStatus({ status: 'success', message: 'Login successful! Redirecting…' });
      setTimeout(() => navigate(ROUTES.ACCOUNT), REDIRECT_DELAY_MS);
    } catch (err) {
      if (isMounted.current) {
        setApiStatus({ status: 'error', message: `Login failed: ${getErrorMessage(err)}` });
      }
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Sign In</h2>
        <p className={styles.sub}>Enter your credentials to access your account.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            id="email"
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password" className={styles.label}>Password</label>
          <div className={styles.pwWrap}>
            <input
              id="password"
              className={styles.pwInput}
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button type="button" className={styles.pwToggle} onClick={() => setShowPw(v => !v)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            type="submit"
            className={styles.btn}
            disabled={apiStatus.status === 'loading'}
          >
            {apiStatus.status === 'loading' ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <StatusBadge status={apiStatus.status} message={apiStatus.message} />

        <p className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.SIGNUP} className={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
