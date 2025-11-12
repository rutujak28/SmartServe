import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { loginSchema } from '@/lib/validation';
import { z } from 'zod';
import { Shield, LogOut } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn, user, signOut } = useAuth();
  const { roles, loading: rolesLoading } = useUserRole();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user && !rolesLoading) {
      if (roles.includes('admin')) {
        navigate('/admin/dashboard', { replace: true });
      } else if (roles.includes('staff')) {
        navigate('/kitchen', { replace: true });
      }
      // If signed in as a non-admin/non-staff, stay on this page to allow switching accounts
    }
  }, [user, roles, rolesLoading, navigate]);

  const handleLogin = async (data: LoginFormData) => {
    const { error } = await signIn(data.email, data.password);
    
    if (!error) {
      // Navigation will be handled by the useEffect above
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-admin-primary/10 via-background to-admin-secondary/10 p-4">
      <Card className="w-full max-w-md border-admin-border">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-admin-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-admin-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Portal</CardTitle>
          <CardDescription>Sign in to access the management dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {user && !rolesLoading && !roles.includes('admin') && !roles.includes('staff') && (
            <Alert className="mb-4">
              <AlertTitle>You're signed in as a customer</AlertTitle>
              <AlertDescription>
                Please sign out to continue to Admin Portal.
                <div className="mt-3">
                  <Button variant="secondary" onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="admin@example.com" 
                        {...field}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        {...field}
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-admin-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                size="lg" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground">
                Customer portal?{' '}
                <Link to="/login" className="text-admin-primary hover:underline font-medium">
                  Go to customer login
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
