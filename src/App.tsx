import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ROUTES } from './config';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Account from './pages/Account';
import Payment from './pages/Payment';

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route
          path={ROUTES.LOGIN}
          element={user ? <Navigate to={ROUTES.ACCOUNT} replace /> : <Login />}
        />
        <Route
          path={ROUTES.SIGNUP}
          element={user ? <Navigate to={ROUTES.ACCOUNT} replace /> : <SignUp />}
        />
        <Route
          path={ROUTES.ACCOUNT}
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PAYMENT}
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </>
  );
}
