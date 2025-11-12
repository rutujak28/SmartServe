import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PieChart } from '@/components/admin/charts/PieChart';
import { MetricCard } from '@/components/admin/charts/MetricCard';
import { TrendIndicator } from '@/components/admin/charts/TrendIndicator';
import { Search, Download, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { paymentService } from '@/lib/services/paymentService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Mock data
const mockTransactions = [
  { id: 'TXN001', orderId: 'ORD001', customer: 'John Doe', amount: 250, method: 'UPI', status: 'completed', date: '2024-01-15 14:30', table: 'T-12' },
  { id: 'TXN002', orderId: 'ORD002', customer: 'Jane Smith', amount: 180, method: 'Cash', status: 'completed', date: '2024-01-15 14:25', table: 'T-05' },
  { id: 'TXN003', orderId: 'ORD003', customer: 'Bob Johnson', amount: 420, method: 'Card', status: 'completed', date: '2024-01-15 14:20', table: 'T-08' },
  { id: 'TXN004', orderId: 'ORD004', customer: 'Alice Brown', amount: 350, method: 'UPI', status: 'failed', date: '2024-01-15 14:15', table: 'T-15' },
  { id: 'TXN005', orderId: 'ORD005', customer: 'Charlie Wilson', amount: 290, method: 'Split', status: 'pending', date: '2024-01-15 14:10', table: 'T-20' },
];

const paymentMethodData = [
  { name: 'UPI', value: 45, color: '#2563eb' },
  { name: 'Cash', value: 30, color: '#059669' },
  { name: 'Card', value: 20, color: '#f59e0b' },
  { name: 'Split Bill', value: 5, color: '#64748b' },
];

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();

    // Real-time subscription for payments
    const channel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        () => {
          console.log('Payment change detected');
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = payments.filter(txn => {
    const matchesSearch = txn.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         txn.order?.user_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || txn.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: { variant: 'default', icon: CheckCircle },
      failed: { variant: 'destructive', icon: XCircle },
      pending: { variant: 'secondary', icon: AlertCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const columns = [
    {
      key: 'id',
      label: 'Transaction ID',
      sortable: true,
      render: (value: string) => <span className="font-mono text-sm">{value}</span>
    },
    {
      key: 'orderId',
      label: 'Order ID',
      sortable: true,
      render: (value: string) => <span className="font-mono text-sm">{value}</span>
    },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'table', label: 'Table', sortable: true },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: number) => <span className="font-semibold">₹{value}</span>
    },
    { key: 'method', label: 'Method', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => getStatusBadge(value)
    },
    { key: 'date', label: 'Date & Time', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setSelectedTransaction(row)}>
            View
          </Button>
          {row.status === 'completed' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setSelectedTransaction(row);
                setRefundModalOpen(true);
              }}
            >
              Refund
            </Button>
          )}
          {row.status === 'failed' && (
            <Button size="sm" variant="outline">
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const handleRefund = () => {
    console.log('Processing refund for:', selectedTransaction.id, refundReason);
    setRefundModalOpen(false);
    setRefundReason('');
  };

  const totalRevenue = payments
    .filter(t => t.payment_status === 'completed')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const failedAmount = payments
    .filter(t => t.payment_status === 'failed')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  if (loading) {
    return (
      <AdminLayout breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Payments' }]}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Payments' }]}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground mt-2">
              Track transactions and manage payment methods.
            </p>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={CheckCircle}
          />
          <MetricCard
            title="Successful Transactions"
            value={payments.filter(t => t.payment_status === 'completed').length.toString()}
            icon={CheckCircle}
          />
          <MetricCard
            title="Failed Payments"
            value={`₹${failedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={AlertCircle}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DataTable
              data={filteredTransactions}
              columns={columns}
              searchable={false}
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
            <PieChart 
              data={paymentMethodData} 
              nameKey="name"
              valueKey="value"
              colors={paymentMethodData.map(m => m.color)}
            />
            <div className="mt-6 space-y-3">
              {paymentMethodData.map((method) => (
                <div key={method.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                    <span className="text-sm">{method.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{method.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={!!selectedTransaction && !refundModalOpen}
        onClose={() => setSelectedTransaction(null)}
        title="Transaction Details"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Transaction ID</Label>
                <p className="font-mono text-sm">{selectedTransaction.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Order ID</Label>
                <p className="font-mono text-sm">{selectedTransaction.orderId}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Customer</Label>
                <p>{selectedTransaction.customer}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Table</Label>
                <p>{selectedTransaction.table}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <p className="text-lg font-bold">₹{selectedTransaction.amount}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Payment Method</Label>
                <p>{selectedTransaction.method}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Date & Time</Label>
                <p>{selectedTransaction.date}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Refund Modal */}
      <Modal
        isOpen={refundModalOpen}
        onClose={() => {
          setRefundModalOpen(false);
          setRefundReason('');
        }}
        title="Process Refund"
      >
        <div className="space-y-4">
          {selectedTransaction && (
            <>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-sm">{selectedTransaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Refund Amount:</span>
                  <span className="font-bold">₹{selectedTransaction.amount}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="refundReason">Refund Reason *</Label>
                <Textarea
                  id="refundReason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter reason for refund..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setRefundModalOpen(false);
                  setRefundReason('');
                }}>
                  Cancel
                </Button>
                <Button onClick={handleRefund} disabled={!refundReason.trim()}>
                  Process Refund
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </AdminLayout>
  );
}
