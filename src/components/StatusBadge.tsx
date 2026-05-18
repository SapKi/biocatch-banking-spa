import { ApiStatus } from '../types';

export default function StatusBadge({ status, message }: ApiStatus) {
  if (!status || status === 'idle') return null;

  const map = {
    loading: { bg: '#e8f0ff', color: '#1a4db5', border: '#a8c0e0' },
    success: { bg: '#e6f9ec', color: '#1a7c3e', border: '#74d99f' },
    error:   { bg: '#fff0f0', color: '#c0392b', border: '#f1a9a9' },
  };

  const theme = map[status] || map.loading;

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '0.75rem 1rem',
        borderRadius: '6px',
        border: `1px solid ${theme.border}`,
        background: theme.bg,
        color: theme.color,
        fontSize: '0.9rem',
      }}
    >
      {status === 'loading' && '⏳ '}
      {status === 'success' && '✅ '}
      {status === 'error' && '❌ '}
      {message}
    </div>
  );
}
