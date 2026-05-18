import { ApiStatus } from '../types';
import styles from './StatusBadge.module.css';

const ICONS: Record<string, string> = {
  loading: '⏳',
  success: '✅',
  error:   '❌',
};

export default function StatusBadge({ status, message }: ApiStatus) {
  if (!status || status === 'idle') return null;

  const cls = {
    loading: styles.loading,
    success: styles.success,
    error:   styles.error,
  }[status] ?? styles.loading;

  return (
    <div className={`${styles.badge} ${cls}`} role="status">
      <span aria-hidden="true">{ICONS[status]} </span>
      {message}
    </div>
  );
}
