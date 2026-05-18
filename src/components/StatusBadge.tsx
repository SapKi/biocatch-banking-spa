import { ApiStatus } from '../types';
import styles from './StatusBadge.module.css';

export default function StatusBadge({ status, message }: ApiStatus) {
  if (!status || status === 'idle') return null;

  const cls = {
    loading: styles.loading,
    success: styles.success,
    error:   styles.error,
  }[status] ?? styles.loading;

  return (
    <div className={`${styles.badge} ${cls}`}>
      {status === 'loading' && '⏳ '}
      {status === 'success' && '✅ '}
      {status === 'error'   && '❌ '}
      {message}
    </div>
  );
}
