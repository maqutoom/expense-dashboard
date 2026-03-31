import { Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from './context/AppContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const { currentUser } = useApp();

  return (
    <Routes>
      <Route
        path="/auth"
        element={currentUser ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route
        path="/"
        element={currentUser ? <DashboardPage /> : <Navigate to="/auth" replace />}
      />
      <Route
        path="*"
        element={<Navigate to={currentUser ? '/' : '/auth'} replace />}
      />
    </Routes>
  );
}
