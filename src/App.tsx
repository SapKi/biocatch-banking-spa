/**
 * App — routing and layout shell.
 *
 * Route structure:
 *   /           → Home       (public)
 *   /login      → Login      (public; redirects to /account if already logged in)
 *   /account    → Account    (protected)
 *   /payment    → Payment    (protected)
 *
 * Context changes are handled per-page via useSDKContext() hooks, NOT here.
 * That design keeps each page self-contained — the page itself declares which
 * SDK context it owns, rather than a central router mapping strings to routes.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Account from './pages/Account';
import Payment from './pages/Payment';

export default function App() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fb', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/account" replace /> : <Login />}
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
