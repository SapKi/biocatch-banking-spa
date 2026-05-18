import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSDKContext } from '../hooks/useSDKContext';
import { triggerGetScore } from '../services/apiService';
import StatusBadge from '../components/StatusBadge';
import { ApiStatus } from '../types';

export default function Payment() {
  useSDKContext('payment_screen');

  const { csid, initDone } = useAuth();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount]       = useState('');
  const [note, setNote]           = useState('');
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ status: 'idle', message: '' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!recipient.trim() || !amount || parseFloat(amount) <= 0) return;

    if (!initDone) {
      setApiStatus({ status: 'error', message: 'Session not initialised. Please log in again.' });
      return;
    }

    setApiStatus({ status: 'loading', message: 'Processing payment…' });

    try {
      // csid is guaranteed non-null here: initDone is only true after a successful login,
      // which always generates and stores a CSID.
      const result = await triggerGetScore(csid!);
      setApiStatus({
        status: 'success',
        message: `Payment of $${parseFloat(amount).toFixed(2)} to ${recipient} submitted successfully.`,
      });
      console.log('[Payment] getScore result:', result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setApiStatus({ status: 'error', message: `Payment failed: ${message}` });
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Make a Payment</h2>
        <p style={styles.sub}>Transfer funds to another account.</p>

        {!initDone && (
          <div style={styles.warning}>
            ⚠️ Session not fully initialised. Please log out and log in again.
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Recipient Account</label>
          <input
            style={styles.input}
            type="text"
            placeholder="e.g. ACC-987654"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />

          <label style={styles.label}>Amount (USD)</label>
          <input
            style={styles.input}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <label style={styles.label}>Note (optional)</label>
          <input
            style={styles.input}
            type="text"
            placeholder="e.g. Rent for May"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button
            type="submit"
            style={{
              ...styles.btn,
              opacity: apiStatus.status === 'loading' || !initDone ? 0.7 : 1,
              cursor: apiStatus.status === 'loading' || !initDone ? 'not-allowed' : 'pointer',
            }}
            disabled={apiStatus.status === 'loading' || !initDone}
          >
            {apiStatus.status === 'loading' ? 'Processing…' : 'Confirm Payment'}
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
    padding: '4rem 1rem',
    minHeight: 'calc(100vh - 60px)',
    background: '#f4f7fb',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 4px 20px rgba(26,43,74,0.1)',
    height: 'fit-content',
  },
  heading: { color: '#1a2b4a', marginBottom: '0.4rem' },
  sub: { color: '#5a6a7e', fontSize: '0.9rem', marginBottom: '1.8rem' },
  warning: {
    background: '#fff8e1',
    border: '1px solid #f9d423',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    color: '#7c6200',
    fontSize: '0.85rem',
    marginBottom: '1.2rem',
  },
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
