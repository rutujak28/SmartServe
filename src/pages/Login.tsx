import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema } from '@/lib/validation';
import { useRateLimit } from '@/hooks/useRateLimit';
import { toast } from 'sonner';
import { z } from 'zod';

// Extend login schema to include remember me
const loginFormSchema = loginSchema.extend({
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();

  // Rate limiting: 5 attempts per 15 minutes
  const { checkRateLimit, reset } = useRateLimit({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    onLimitReached: () => {
      toast.error('Too many login attempts. Please try again in 15 minutes.');
    },
  });

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (data: LoginFormData) => {
    // Check rate limit before attempting login
    if (!checkRateLimit()) {
      return;
    }

    const { error } = await signIn(data.email, data.password);
    
    if (!error) {
      reset(); // Reset rate limit on successful login
      navigate('/home');
    } else {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Login to continue ordering</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
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
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        Remember me
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
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
                {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground">
                New user?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
              
              <p className="text-center text-sm text-muted-foreground border-t pt-4">
                Staff or Admin?{' '}
                <Link to="/admin/login" className="text-primary hover:underline font-medium">
                  Go to Admin Portal
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
