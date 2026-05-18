import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config';
import styles from './Home.module.css';

const FEATURES = [
  { icon: '🔒', title: 'Secure Sessions',   desc: 'Every session is protected with behavioral biometrics.' },
  { icon: '⚡', title: 'Instant Transfers', desc: 'Send money in seconds with real-time fraud detection.'  },
  { icon: '📊', title: 'Account Insights',  desc: 'Track your spending and balances at a glance.'          },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Welcome to SecureBank</h1>
        <p className={styles.subtitle}>Your trusted partner for secure digital banking.</p>
        {user ? (
          <Link to={ROUTES.ACCOUNT} className={styles.cta}>Go to My Account →</Link>
        ) : (
          <Link to={ROUTES.LOGIN} className={styles.cta}>Get Started →</Link>
        )}
      </div>

      <div className={styles.features}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.card}>
            <div className={styles.cardIcon}>{f.icon}</div>
            <h3 className={styles.cardTitle}>{f.title}</h3>
            <p className={styles.cardDesc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
