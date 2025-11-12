import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart } from '@/components/admin/charts/LineChart';
import { BarChart } from '@/components/admin/charts/BarChart';
import { PieChart } from '@/components/admin/charts/PieChart';
import { MetricCard } from '@/components/admin/charts/MetricCard';
import { DataTable, Column } from '@/components/admin/DataTable';
import { AdminButton } from '@/components/admin/AdminButton';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Star,
  Calendar,
  Download
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data
const revenueData = [
  { month: 'Jan', revenue: 12400, orders: 145 },
  { month: 'Feb', revenue: 15200, orders: 178 },
  { month: 'Mar', revenue: 18900, orders: 220 },
  { month: 'Apr', revenue: 16700, orders: 195 },
  { month: 'May', revenue: 21300, orders: 248 },
  { month: 'Jun', revenue: 25600, orders: 298 },
];

const salesByCategory = [
  { category: 'Breakfast', sales: 8500 },
  { category: 'Lunch', sales: 15200 },
  { category: 'Snacks', sales: 6800 },
  { category: 'Beverages', sales: 4200 },
  { category: 'Chinese', sales: 7300 },
];

const paymentMethods = [
  { name: 'UPI', value: 45 },
  { name: 'Card', value: 30 },
  { name: 'Cash', value: 20 },
  { name: 'Split', value: 5 },
];

interface PopularItem {
  rank: number;
  item: string;
  category: string;
  orders: number;
  revenue: string;
  rating: number;
}

const popularItems: PopularItem[] = [
  { rank: 1, item: 'Masala Dosa', category: 'Breakfast', orders: 342, revenue: '₹27,360', rating: 4.8 },
  { rank: 2, item: 'Chicken Biryani', category: 'Lunch', orders: 298, revenue: '₹44,700', rating: 4.9 },
  { rank: 3, item: 'Samosa', category: 'Snacks', orders: 456, revenue: '₹13,680', rating: 4.6 },
  { rank: 4, item: 'Cappuccino', category: 'Beverages', orders: 387, revenue: '₹27,090', rating: 4.7 },
  { rank: 5, item: 'Veg Fried Rice', category: 'Chinese', orders: 265, revenue: '₹26,500', rating: 4.5 },
];

export default function Analytics() {
  const [dateRange, setDateRange] = useState('7d');

  const popularItemsColumns: Column<PopularItem>[] = [
    { key: 'rank', label: 'Rank', sortable: true },
    { key: 'item', label: 'Item', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'orders', label: 'Orders', sortable: true },
    { key: 'revenue', label: 'Revenue', sortable: true },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-admin-warning text-admin-warning" />
          <span>{item.rating}</span>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Analytics' }]}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Insights and performance metrics for your canteen.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <AdminButton variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </AdminButton>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value="₹1,25,400"
            icon={TrendingUp}
            trend={18}
            trendLabel="vs last period"
            color="text-admin-success"
            bgColor="bg-admin-success/10"
          />
          <MetricCard
            title="Total Orders"
            value="1,284"
            icon={ShoppingCart}
            trend={12}
            trendLabel="vs last period"
            color="text-admin-primary"
            bgColor="bg-admin-primary/10"
          />
          <MetricCard
            title="Active Customers"
            value="856"
            icon={Users}
            trend={8}
            trendLabel="vs last period"
            color="text-admin-warning"
            bgColor="bg-admin-warning/10"
          />
          <MetricCard
            title="Avg Rating"
            value="4.7"
            icon={Star}
            trend={3}
            trendLabel="vs last period"
            color="text-admin-warning"
            bgColor="bg-admin-warning/10"
          />
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
            <TabsTrigger value="sales">Sales by Category</TabsTrigger>
            <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Orders Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={revenueData}
                  xKey="month"
                  lines={[
                    { key: 'revenue', color: 'hsl(var(--admin-success))', name: 'Revenue (₹)' },
                    { key: 'orders', color: 'hsl(var(--admin-primary))', name: 'Orders' },
                  ]}
                  height={350}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={salesByCategory}
                  xKey="category"
                  bars={[
                    { key: 'sales', color: 'hsl(var(--admin-primary))', name: 'Sales (₹)' },
                  ]}
                  height={350}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={paymentMethods}
                  nameKey="name"
                  valueKey="value"
                  colors={[
                    'hsl(var(--admin-primary))',
                    'hsl(var(--admin-success))',
                    'hsl(var(--admin-warning))',
                    'hsl(var(--admin-secondary))',
                  ]}
                  height={350}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Popular Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Items</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={popularItems}
              columns={popularItemsColumns}
              searchPlaceholder="Search items..."
              pageSize={10}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
