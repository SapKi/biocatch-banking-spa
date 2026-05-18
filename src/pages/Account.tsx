import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSDKContext } from '../hooks/useSDKContext';
import { getTransactions } from '../utils/transactionStore';
import { getBalances } from '../db/userStore';
import styles from './Account.module.css';

function fmt(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export default function Account() {
  useSDKContext('account_screen');

  const { user, csid } = useAuth();
  const email = user!.email;

  const transactions          = getTransactions(email);
  const { checking, savings } = getBalances(email);

  const accounts = [
    { id: 'CHK-001', type: 'Checking Account', description: 'Day-to-day spending', balance: checking },
    { id: 'SAV-001', type: 'Savings Account',  description: 'Long-term savings',   balance: savings  },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.heading}>Account Overview</h2>
          <p className={styles.sub}>Welcome back, {email}</p>
        </div>
        <Link to="/payment" className={styles.payBtn}>Make a Payment</Link>
      </div>

      <div className={styles.accountGrid}>
        {accounts.map((acc) => (
          <div key={acc.id} className={styles.accountCard}>
            <div className={styles.accType}>{acc.type}</div>
            <div className={styles.accDesc}>{acc.description}</div>
            <div className={styles.accBalance}>{fmt(acc.balance)}</div>
            <div className={styles.accId}>Account {acc.id}</div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p className={styles.empty}>No transactions yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Description</th>
                <th className={`${styles.th} ${styles.thRight}`}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td className={styles.td}>{tx.date}</td>
                  <td className={styles.td}>{tx.description}</td>
                  <td
                    className={`${styles.td} ${styles.tdRight}`}
                    style={{ color: tx.amount < 0 ? '#c0392b' : '#1a7c3e' }}
                  >
                    {fmt(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <details className={styles.debug}>
        <summary style={{ cursor: 'pointer', color: '#5a6a7e', fontSize: '0.8rem' }}>
          Session Debug
        </summary>
        <code className={styles.debugCode}>CSID: {csid}</code>
      </details>
    </div>
  );
}
