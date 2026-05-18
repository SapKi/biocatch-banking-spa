import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.brand}>
        🏦 SecureBank
      </Link>
      <div className={styles.links}>
        {user ? (
          <>
            <Link to="/account" className={styles.link}>Account</Link>
            <Link to="/payment" className={styles.link}>Payment</Link>
            <span className={styles.userLabel}>👤 {user.email}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.link}>Login</Link>
            <Link to="/signup" className={styles.signUpBtn}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
