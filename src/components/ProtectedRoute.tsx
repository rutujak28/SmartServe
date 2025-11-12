import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: rolesLoading, hasRole } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  const loading = authLoading || rolesLoading;

  useEffect(() => {
    if (!loading && !user) {
      const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/kitchen');
      navigate(isAdminRoute ? '/admin/login' : '/login', { replace: true });
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-lg">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="mt-2">
            You don't have permission to access this page. Required roles: {allowedRoles.join(', ')}.
            <div className="mt-4">
              <Button onClick={() => navigate('/home')}>
                Go to Home
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
