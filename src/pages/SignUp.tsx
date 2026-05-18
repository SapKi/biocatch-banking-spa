import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSDKContext } from '../hooks/useSDKContext';
import { triggerRegister } from '../services/apiService';
import { registerUser, removeUser } from '../db/userStore';
import { getErrorMessage } from '../utils/error';
import { SCREENS, ROUTES, REDIRECT_DELAY_MS } from '../config';
import StatusBadge from '../components/StatusBadge';
import { ApiStatus } from '../types';
import styles from '../styles/form.module.css';

export default function SignUp() {
  useSDKContext(SCREENS.SIGNUP);

  const { startSession, completeAuth } = useAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

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
      if (isMounted.current) {
        setApiStatus({ status: 'success', message: 'Account created! Redirecting…' });
        setTimeout(() => navigate(ROUTES.ACCOUNT), REDIRECT_DELAY_MS);
      }
    } catch (err) {
      removeUser(email.trim());
      if (isMounted.current) {
        setApiStatus({ status: 'error', message: `Registration failed: ${getErrorMessage(err)}` });
      }
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Create Account</h2>
        <p className={styles.sub}>Open your SecureBank account in seconds.</p>

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
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button type="button" className={styles.pwToggle} onClick={() => setShowPw(v => !v)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
          <div className={styles.pwWrap}>
            <input
              id="confirmPassword"
              className={styles.pwInput}
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button type="button" className={styles.pwToggle} onClick={() => setShowConfirm(v => !v)}>
              {showConfirm ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            type="submit"
            className={styles.btn}
            disabled={apiStatus.status === 'loading'}
          >
            {apiStatus.status === 'loading' ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <StatusBadge status={apiStatus.status} message={apiStatus.message} />

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
