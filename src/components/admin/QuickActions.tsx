import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminButton } from './AdminButton';
import { Plus, FileText, BarChart3, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AdminButton 
            variant="outline" 
            className="h-auto flex-col gap-2 py-4"
            onClick={() => navigate('/admin/orders')}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">View Orders</span>
          </AdminButton>
          <AdminButton 
            variant="outline" 
            className="h-auto flex-col gap-2 py-4"
            onClick={() => navigate('/admin/menu')}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Add Menu Item</span>
          </AdminButton>
          <AdminButton 
            variant="outline" 
            className="h-auto flex-col gap-2 py-4"
            onClick={() => navigate('/admin/reports')}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs">Generate Report</span>
          </AdminButton>
          <AdminButton 
            variant="outline" 
            className="h-auto flex-col gap-2 py-4"
            onClick={() => navigate('/admin/analytics')}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">View Analytics</span>
          </AdminButton>
        </div>
      </CardContent>
    </Card>
  );
}
