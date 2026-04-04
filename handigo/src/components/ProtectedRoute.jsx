import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ redirectTo = "/login", message }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user && message) {
      toast.error(message, { id: 'protected-route-toast' });
    }
  }, [loading, user, message]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in, redirect
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children (the protected routes)
  return <Outlet />;
};

export default ProtectedRoute;
