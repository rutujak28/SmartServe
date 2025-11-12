import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { MetricCard } from '@/components/admin/charts/MetricCard';
import { Search, UserPlus, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userService, UserProfile } from '@/lib/services/userService';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ role: 'customer', status: 'active' });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrderHistory = async (userId: string) => {
    try {
      const orders = await userService.getUserOrderHistory(userId);
      setOrderHistory(orders || []);
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast.error('Failed to load order history');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter as any);
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'destructive',
      staff: 'default',
      customer: 'secondary',
    };
    return <Badge variant={colors[role] as any}>{role.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="gap-1">
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge variant="destructive" className="gap-1">
        <Ban className="h-3 w-3" />
        Suspended
      </Badge>
    );
  };

  const columns = [
    { 
      key: 'full_name', 
      label: 'Name', 
      sortable: true,
      render: (row: UserProfile) => row.full_name || 'N/A'
    },
    { 
      key: 'email', 
      label: 'Email', 
      sortable: true,
      render: (row: UserProfile) => row.email || 'N/A'
    },
    { 
      key: 'phone', 
      label: 'Phone', 
      sortable: true,
      render: (row: UserProfile) => row.phone || 'N/A'
    },
    {
      key: 'roles',
      label: 'Role',
      sortable: true,
      render: (row: UserProfile) => getRoleBadge(row.roles[0] || 'customer')
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: () => getStatusBadge('active')
    },
    {
      key: 'order_count',
      label: 'Orders',
      sortable: true,
      render: (row: UserProfile) => <span className="font-semibold">{row.order_count || 0}</span>
    },
    { 
      key: 'created_at', 
      label: 'Joined', 
      sortable: true,
      render: (row: UserProfile) => format(new Date(row.created_at), 'MMM dd, yyyy')
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: UserProfile) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setSelectedUser(row);
              fetchUserOrderHistory(row.id);
            }}
          >
            View
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setSelectedUser(row);
              setFormData({ role: row.roles[0] || 'customer', status: 'active' });
              setEditModalOpen(true);
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <AdminLayout breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Users' }]}>
        <div className="flex items-center justify-center h-[50vh]">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Update role
      await userService.updateUserRole(selectedUser.id, formData.role as any, 'add');
      toast.success('User updated successfully');
      setEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.length; // All Supabase users are active
  const staffCount = users.filter(u => u.roles.includes('staff') || u.roles.includes('admin')).length;

  return (
    <AdminLayout breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Users' }]}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground mt-2">
              Manage customer accounts and staff permissions.
            </p>
          </div>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total Users"
            value={totalUsers.toString()}
            icon={UserPlus}
            trendLabel="Registered accounts"
          />
          <MetricCard
            title="Active Users"
            value={activeUsers.toString()}
            icon={CheckCircle}
            trendLabel="Currently active"
          />
          <MetricCard
            title="Staff Members"
            value={staffCount.toString()}
            icon={UserPlus}
            trendLabel="Admin & Staff"
          />
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            data={filteredUsers}
            columns={columns}
            searchable={false}
          />
        </Card>
      </div>

      {/* User Detail Modal */}
      <Modal
        isOpen={!!selectedUser && !editModalOpen}
        onClose={() => setSelectedUser(null)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <Tabs defaultValue="info">
            <TabsList>
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-semibold">{selectedUser.full_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{selectedUser.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p>{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Roles</Label>
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {selectedUser.roles.map(role => getRoleBadge(role))}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge('active')}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Orders</Label>
                  <p className="font-semibold">{selectedUser.order_count || 0}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Joined Date</Label>
                  <p>{format(new Date(selectedUser.created_at), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              <div className="space-y-2">
                {orderHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No order history</p>
                ) : (
                  orderHistory.map(order => (
                    <Card key={order.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">#{order.id.substring(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">{format(new Date(order.created_at), 'MMM dd, yyyy')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{parseFloat(order.total_amount).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{order.order_items?.length || 0} items</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-semibold">Account created</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(selectedUser.created_at), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                {orderHistory.slice(0, 3).map(order => (
                  <div key={order.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="font-semibold">Placed order #{order.id.substring(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(order.created_at), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit User"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <p className="font-semibold mt-1">{selectedUser.full_name || 'N/A'}</p>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>
                Update User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
