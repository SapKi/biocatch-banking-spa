import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSDKContext } from '../hooks/useSDKContext';
import { triggerInit } from '../services/apiService';
import StatusBadge from '../components/StatusBadge';
import { ApiStatus } from '../types';

export default function Login() {
  useSDKContext('login_screen');

  const { login, markInitDone } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ status: 'idle', message: '' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    login({ username: username.trim() });
    // login() writes the CSID to sessionStorage synchronously; read it back here.
    const activeCsid = sessionStorage.getItem('csid')!;

    setApiStatus({ status: 'loading', message: 'Authenticating…' });

    try {
      await triggerInit(activeCsid);
      markInitDone();
      setApiStatus({ status: 'success', message: 'Login successful! Redirecting…' });
      setTimeout(() => navigate('/account'), 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setApiStatus({ status: 'error', message: `Login failed: ${message}` });
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Sign In</h2>
        <p style={styles.sub}>Enter your credentials to access your account.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            placeholder="e.g. john.doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button
            type="submit"
            style={{
              ...styles.btn,
              opacity: apiStatus.status === 'loading' ? 0.7 : 1,
              cursor: apiStatus.status === 'loading' ? 'not-allowed' : 'pointer',
            }}
            disabled={apiStatus.status === 'loading'}
          >
            {apiStatus.status === 'loading' ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <StatusBadge status={apiStatus.status} message={apiStatus.message} />
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '4rem 1rem',
    minHeight: 'calc(100vh - 60px)',
    background: '#f4f7fb',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 20px rgba(26,43,74,0.1)',
  },
  heading: { color: '#1a2b4a', marginBottom: '0.4rem' },
  sub: { color: '#5a6a7e', fontSize: '0.9rem', marginBottom: '1.8rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  label: { color: '#1a2b4a', fontSize: '0.875rem', fontWeight: 600 },
  input: {
    padding: '0.7rem 0.9rem',
    border: '1px solid #ccd9ef',
    borderRadius: '6px',
    fontSize: '1rem',
    marginBottom: '0.6rem',
    outline: 'none',
  },
  btn: {
    marginTop: '0.5rem',
    padding: '0.85rem',
    background: '#1a4db5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 600,
  },
};
