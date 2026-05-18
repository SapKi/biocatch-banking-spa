import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSDKContext } from '../hooks/useSDKContext';

const MOCK_ACCOUNTS = [
  { id: 'CHK-001', type: 'Checking', balance: 4_820.35, currency: 'USD' },
  { id: 'SAV-001', type: 'Savings',  balance: 12_500.00, currency: 'USD' },
];

const MOCK_TRANSACTIONS = [
  { date: '2026-05-17', description: 'Netflix Subscription', amount: -15.99 },
  { date: '2026-05-16', description: 'Salary Deposit',       amount: 3_200.00 },
  { date: '2026-05-14', description: 'Amazon Purchase',      amount: -89.50 },
  { date: '2026-05-12', description: 'Electricity Bill',     amount: -120.00 },
];

function fmt(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export default function Account() {
  useSDKContext('account_screen');

  const { user, csid } = useAuth();

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>Account Overview</h2>
          <p style={styles.sub}>Welcome back, {user?.username}</p>
        </div>
        <Link to="/payment" style={styles.payBtn}>Make a Payment</Link>
      </div>

      {/* Account cards */}
      <div style={styles.accountGrid}>
        {MOCK_ACCOUNTS.map((acc) => (
          <div key={acc.id} style={styles.accountCard}>
            <div style={styles.accType}>{acc.type}</div>
            <div style={styles.accBalance}>{fmt(acc.balance, acc.currency)}</div>
            <div style={styles.accId}>Account {acc.id}</div>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Recent Transactions</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Description</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TRANSACTIONS.map((tx, i) => (
              <tr key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td style={styles.td}>{tx.date}</td>
                <td style={styles.td}>{tx.description}</td>
                <td style={{ ...styles.td, textAlign: 'right', color: tx.amount < 0 ? '#c0392b' : '#1a7c3e', fontWeight: 600 }}>
                  {fmt(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Debug info */}
      <details style={styles.debug}>
        <summary style={{ cursor: 'pointer', color: '#5a6a7e', fontSize: '0.8rem' }}>
          Session Debug
        </summary>
        <code style={styles.code}>CSID: {csid}</code>
      </details>
    </div>
  );
}

const styles = {
  page: { maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  heading: { color: '#1a2b4a', marginBottom: '0.25rem' },
  sub: { color: '#5a6a7e', fontSize: '0.9rem' },
  payBtn: {
    padding: '0.7rem 1.5rem',
    background: '#1a4db5',
    color: '#fff',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  accountGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '2.5rem' },
  accountCard: {
    background: '#1a2b4a',
    color: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 16px rgba(26,43,74,0.2)',
  },
  accType: { fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
  accBalance: { fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' },
  accId: { fontSize: '0.8rem', opacity: 0.6 },
  section: { background: '#fff', borderRadius: '10px', border: '1px solid #e0e8f5', overflow: 'hidden' },
  sectionTitle: { color: '#1a2b4a', padding: '1rem 1.25rem', borderBottom: '1px solid #e0e8f5', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '0.75rem 1.25rem', textAlign: 'left', color: '#5a6a7e', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f8fafd' },
  td: { padding: '0.85rem 1.25rem', color: '#1a2b4a', fontSize: '0.9rem' },
  rowEven: { background: '#fff' },
  rowOdd: { background: '#f8fafd' },
  debug: { marginTop: '1.5rem' },
  code: { display: 'block', marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#5a6a7e', wordBreak: 'break-all' },
};
