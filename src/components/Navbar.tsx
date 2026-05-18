import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate(ROUTES.HOME);
  }

  return (
    <nav className={styles.nav}>
      <Link to={ROUTES.HOME} className={styles.brand}>
        🏦 SecureBank
      </Link>
      <div className={styles.links}>
        {user ? (
          <>
            <Link to={ROUTES.ACCOUNT} className={styles.link}>Account</Link>
            <Link to={ROUTES.PAYMENT} className={styles.link}>Payment</Link>
            <span className={styles.userLabel}>{user.email}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to={ROUTES.LOGIN}  className={styles.link}>Login</Link>
            <Link to={ROUTES.SIGNUP} className={styles.signUpBtn}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
