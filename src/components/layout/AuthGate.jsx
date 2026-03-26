import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * AuthGate wraps routes that require authentication.
 * Redirects to /login if user is not authenticated.
 * Optionally checks for staff/admin role.
 */
export default function AuthGate({ children, requireStaff = false }) {
  const { isAuthenticated, isStaff, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'var(--font-family)',
        color: 'var(--color-text-muted)',
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireStaff && !isStaff) {
    return <Navigate to="/" replace />;
  }

  return children;
}
