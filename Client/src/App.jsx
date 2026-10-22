

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Faculty from './pages/dashboard/Faculty';
import Student from './pages/dashboard/Student';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/dashboard/Admin';
import { verifySession, logout } from './store/auth/authSlice';

//* Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

//! Protected Route component - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

//! Public Route component for login page only - redirects to dashboard if already authenticated
const PublicRoute = ({ children, requireAuth = false }) => {
  const { isAuthenticated, userData, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <LoadingSpinner />;
  }

  //* Only redirect to dashboard if this is the login page and user is authenticated
  if (requireAuth && isAuthenticated && userData?.role) {
    const role = userData.role.toLowerCase();
    const dashboardPath = role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty' : '/student';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

function App() {
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();

  // Verify session on app load
  useEffect(() => {
    dispatch(verifySession());
  }, [dispatch]);

  //* Listen for session expiration
  useEffect(() => {
    const handleSessionExpired = () => {
      console.log('[App] Session expired');
      dispatch(logout());
    };

    window.addEventListener('auth:sessionExpired', handleSessionExpired);
    return () => window.removeEventListener('auth:sessionExpired', handleSessionExpired);
  }, [dispatch]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#1f2937',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: theme === 'dark' ? '#1f2937' : '#ffffff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: theme === 'dark' ? '#1f2937' : '#ffffff',
            },
          },
          loading: {
            duration: Infinity,
            iconTheme: {
              primary: '#3b82f6',
              secondary: theme === 'dark' ? '#1f2937' : '#ffffff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<PublicRoute requireAuth><Login /></PublicRoute>} />
        <Route path="/" element={<Layout />}  >
          <Route index element={<Home />} />
          <Route path="/faculty" element={<ProtectedRoute><Faculty /></ProtectedRoute>} />
          <Route path="/student" element={<ProtectedRoute><Student /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
