import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSDKContext } from '../hooks/useSDKContext';
import { triggerGetScore } from '../services/apiService';
import { addTransaction } from '../db/transactionStore';
import { deductFromChecking, getBalances } from '../db/userStore';
import { getErrorMessage } from '../utils/error';
import { formatCurrency } from '../utils/format';
import { SCREENS, ROUTES } from '../config';
import StatusBadge from '../components/StatusBadge';
import { log } from '../utils/logger';
import { ApiStatus } from '../types';
import base from '../styles/form.module.css';
import styles from './Payment.module.css';

export default function Payment() {
  useSDKContext(SCREENS.PAYMENT);

  const { csid, initDone, user } = useAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

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
    if (!csid || !user) return;

    if (!initDone) {
      setApiStatus({ status: 'error', message: 'Session not initialised. Please log in again.' });
      return;
    }

    const paid  = parseFloat(amount);
    const email = user.email;
    const { checking } = getBalances(email);

    if (paid > checking) {
      setApiStatus({ status: 'error', message: `Insufficient funds. Available balance: ${formatCurrency(checking)}` });
      return;
    }

    setApiStatus({ status: 'loading', message: 'Processing payment…' });

    try {
      const result = await triggerGetScore(csid, email);

      deductFromChecking(email, paid);
      addTransaction(email, {
        date:        new Date().toISOString().split('T')[0],
        description: `Transfer to ${recipient.trim()}`,
        amount:      -paid,
      });

      if (isMounted.current) {
        setApiStatus({
          status:  'success',
          message: `Payment of ${formatCurrency(paid)} to ${recipient.trim()} submitted successfully.`,
        });
        log.payment.info('getScore result:', result);
      }
    } catch (err) {
      if (isMounted.current) {
        setApiStatus({ status: 'error', message: `Payment failed: ${getErrorMessage(err)}` });
      }
    }
  }

  return (
    <div className={base.page}>
      <div className={`${base.card} ${styles.card}`}>
        <h2 className={base.heading}>Make a Payment</h2>
        <p className={base.sub}>Transfer funds to another account.</p>

        {!initDone && (
          <div className={styles.warning}>
            Session not fully initialised. Please log out and log in again.
          </div>
        )}

        <form onSubmit={handleSubmit} className={base.form}>
          <label htmlFor="recipient" className={base.label}>Recipient Account</label>
          <input
            id="recipient"
            className={base.input}
            type="text"
            placeholder="e.g. ACC-987654"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />

          <label htmlFor="amount" className={base.label}>Amount (USD)</label>
          <input
            id="amount"
            className={base.input}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <button
            type="submit"
            className={base.btn}
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
            <button onClick={() => navigate(ROUTES.ACCOUNT)} className={styles.btnGhost}>
              View Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
