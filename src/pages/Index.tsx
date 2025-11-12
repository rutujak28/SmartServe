import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center space-y-8">
        <div>
          <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="mb-4 text-4xl font-bold">SmartServe</h1>
          <p className="text-xl text-muted-foreground">Your Smart Canteen Solution</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/login">
              Customer Login
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg">
            <Link to="/admin/login">
              <Shield className="w-4 h-4 mr-2" />
              Admin Portal
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
