import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSDKContext } from '../hooks/useSDKContext';
import { getTransactions } from '../db/transactionStore';
import { getBalance } from '../db/userStore';
import { formatCurrency } from '../utils/format';
import { SCREENS, ROUTES } from '../config';
import styles from './Account.module.css';

export default function Account() {
  useSDKContext(SCREENS.ACCOUNT);

  const { user, csid } = useAuth();
  const email          = user!.email;
  const balance        = getBalance(email);
  const transactions   = getTransactions(email);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.heading}>Account Overview</h2>
          <p className={styles.sub}>Welcome back, {email}</p>
        </div>
        <Link to={ROUTES.PAYMENT} className={styles.payBtn}>Make a Payment</Link>
      </div>

      <div className={styles.accountCard}>
        <div className={styles.accType}>Checking Account</div>
        <div className={styles.accDesc}>Day-to-day spending</div>
        <div className={styles.accBalance}>{formatCurrency(balance)}</div>
        <div className={styles.accId}>Account CHK-001</div>
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
                <tr key={tx.id} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td className={styles.td}>{tx.date}</td>
                  <td className={styles.td}>{tx.description}</td>
                  <td className={`${styles.td} ${styles.tdRight} ${tx.amount < 0 ? styles.debit : styles.credit}`}>
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <details className={styles.debug}>
        <summary className={styles.debugSummary}>Session Debug</summary>
        <code className={styles.debugCode}>CSID: {csid}</code>
      </details>
    </div>
  );
}
