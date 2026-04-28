import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store';

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role && !(role === 'staff' && user?.role === 'admin')) {
    return <Navigate to="/" replace />;
  }

  return children;
}
