import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSDKContext } from '../hooks/useSDKContext';

export default function Home() {
  useSDKContext('home_screen');

  const { user } = useAuth();

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Welcome to SecureBank</h1>
        <p style={styles.subtitle}>
          Your trusted partner for secure digital banking.
        </p>
        {user ? (
          <Link to="/account" style={styles.cta}>
            Go to My Account →
          </Link>
        ) : (
          <Link to="/login" style={styles.cta}>
            Get Started →
          </Link>
        )}
      </div>

      <div style={styles.features}>
        {[
          { icon: '🔒', title: 'Secure Sessions', desc: 'Every session is protected with behavioral biometrics.' },
          { icon: '⚡', title: 'Instant Transfers', desc: 'Send money in seconds with real-time fraud detection.' },
          { icon: '📊', title: 'Account Insights', desc: 'Track your spending and balances at a glance.' },
        ].map((f) => (
          <div key={f.title} style={styles.card}>
            <div style={styles.cardIcon}>{f.icon}</div>
            <h3 style={styles.cardTitle}>{f.title}</h3>
            <p style={styles.cardDesc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' },
  hero: { textAlign: 'center', marginBottom: '4rem' },
  title: { fontSize: '2.5rem', color: '#1a2b4a', marginBottom: '1rem' },
  subtitle: { fontSize: '1.15rem', color: '#5a6a7e', marginBottom: '2rem' },
  cta: {
    display: 'inline-block',
    padding: '0.85rem 2.2rem',
    background: '#1a4db5',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '1rem',
  },
  features: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' },
  card: {
    background: '#fff',
    border: '1px solid #e0e8f5',
    borderRadius: '10px',
    padding: '1.5rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(26,43,74,0.06)',
  },
  cardIcon: { fontSize: '2rem', marginBottom: '0.75rem' },
  cardTitle: { color: '#1a2b4a', marginBottom: '0.5rem' },
  cardDesc: { color: '#5a6a7e', fontSize: '0.9rem', lineHeight: 1.5 },
};
