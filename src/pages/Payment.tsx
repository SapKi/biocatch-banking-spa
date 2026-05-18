import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSDKContext } from '../hooks/useSDKContext';
import { triggerGetScore } from '../services/apiService';
import { addTransaction } from '../utils/transactionStore';
import { deductFromChecking } from '../db/userStore';
import StatusBadge from '../components/StatusBadge';
import { log } from '../utils/logger';
import { ApiStatus } from '../types';
import styles from './Payment.module.css';

export default function Payment() {
  useSDKContext('payment_screen');

  const { csid, initDone, user } = useAuth();
  const navigate = useNavigate();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount]       = useState('');
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ status: 'idle', message: '' });

  function handleAnotherPayment() {
    setRecipient('');
    setAmount('');
    setApiStatus({ status: 'idle', message: '' });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!recipient.trim() || !amount || parseFloat(amount) <= 0) return;

    if (!initDone) {
      setApiStatus({ status: 'error', message: 'Session not initialised. Please log in again.' });
      return;
    }

    setApiStatus({ status: 'loading', message: 'Processing payment…' });

    try {
      const email = user!.email;
      const paid  = parseFloat(amount);
      const result = await triggerGetScore(csid!, email);

      deductFromChecking(email, paid);
      addTransaction(email, {
        date:        new Date().toISOString().split('T')[0],
        description: `Transfer to ${recipient}`,
        amount:      -paid,
      });

      setApiStatus({
        status: 'success',
        message: `Payment of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(paid)} to ${recipient} submitted successfully.`,
      });
      log.payment.info('getScore result:', result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setApiStatus({ status: 'error', message: `Payment failed: ${message}` });
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Make a Payment</h2>
        <p className={styles.sub}>Transfer funds to another account.</p>

        {!initDone && (
          <div className={styles.warning}>
            ⚠️ Session not fully initialised. Please log out and log in again.
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Recipient Account</label>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. ACC-987654"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />

          <label className={styles.label}>Amount (USD)</label>
          <input
            className={styles.input}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button
            type="submit"
            className={styles.btn}
            style={{
              opacity: apiStatus.status === 'loading' || !initDone ? 0.7 : 1,
              cursor:  apiStatus.status === 'loading' || !initDone ? 'not-allowed' : 'pointer',
            }}
            disabled={apiStatus.status === 'loading' || !initDone}
          >
            {apiStatus.status === 'loading' ? 'Processing…' : 'Confirm Payment'}
          </button>
        </form>

        <StatusBadge status={apiStatus.status} message={apiStatus.message} />

        {apiStatus.status === 'success' && (
          <div className={styles.actions}>
            <button onClick={handleAnotherPayment} className={styles.btnSecondary}>
              Make Another Payment
            </button>
            <button onClick={() => navigate('/account')} className={styles.btnGhost}>
              View Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
