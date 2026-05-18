import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        🏦 SecureBank
      </Link>
      <div style={styles.links}>
        {user ? (
          <>
            <Link to="/account" style={styles.link}>Account</Link>
            <Link to="/payment" style={styles.link}>Payment</Link>
            <span style={styles.userLabel}>👤 {user.username}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={styles.link}>Login</Link>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    height: '60px',
    background: '#1a2b4a',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  },
  brand: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1.2rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  link: {
    color: '#a8c0e0',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  userLabel: {
    color: '#a8c0e0',
    fontSize: '0.9rem',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #a8c0e0',
    color: '#a8c0e0',
    padding: '0.35rem 0.9rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
};
