import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { MetricCard } from '@/components/admin/charts/MetricCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { auditService, AuditLog } from '@/lib/services/auditService';
import { Shield, Activity, Database, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLogs: 0,
    insertCount: 0,
    updateCount: 0,
    deleteCount: 0,
  });
  const [filters, setFilters] = useState({
    action: '',
    tableName: '',
    limit: 100,
  });

  useEffect(() => {
    loadAuditLogs();
    loadStatistics();
  }, [filters]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await auditService.getAuditLogs(filters);
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const statistics = await auditService.getAuditStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleCleanOldLogs = async () => {
    if (!confirm('This will permanently delete audit logs older than 90 days. Continue?')) {
      return;
    }

    try {
      await auditService.cleanOldLogs();
      toast.success('Old audit logs cleaned successfully');
      loadAuditLogs();
      loadStatistics();
    } catch (error) {
      console.error('Error cleaning logs:', error);
      toast.error('Failed to clean old logs');
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      INSERT: 'default',
      UPDATE: 'secondary',
      DELETE: 'destructive',
    };
    return <Badge variant={variants[action] || 'default'}>{action}</Badge>;
  };

  const columns = [
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (log: AuditLog) => format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss'),
    },
    {
      key: 'action',
      label: 'Action',
      render: (log: AuditLog) => getActionBadge(log.action),
    },
    {
      key: 'table_name',
      label: 'Table',
      render: (log: AuditLog) => (
        <span className="font-mono text-sm">{log.table_name}</span>
      ),
    },
    {
      key: 'user_id',
      label: 'User ID',
      render: (log: AuditLog) => (
        <span className="font-mono text-xs text-muted-foreground">
          {log.user_id ? log.user_id.slice(0, 8) + '...' : 'System'}
        </span>
      ),
    },
    {
      key: 'record_id',
      label: 'Record ID',
      render: (log: AuditLog) => (
        <span className="font-mono text-xs text-muted-foreground">
          {log.record_id ? log.record_id.slice(0, 8) + '...' : '-'}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">Track all sensitive operations and changes</p>
          </div>
          <Button onClick={handleCleanOldLogs} variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clean Old Logs
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Logs"
            value={stats.totalLogs.toLocaleString()}
            icon={Shield}
            trend={0}
          />
          <MetricCard
            title="Inserts"
            value={stats.insertCount.toLocaleString()}
            icon={Activity}
            trend={0}
          />
          <MetricCard
            title="Updates"
            value={stats.updateCount.toLocaleString()}
            icon={Database}
            trend={0}
          />
          <MetricCard
            title="Deletes"
            value={stats.deleteCount.toLocaleString()}
            icon={Trash2}
            trend={0}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select
            value={filters.action}
            onValueChange={(value) => setFilters({ ...filters, action: value })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              <SelectItem value="INSERT">Insert</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter by table name"
            value={filters.tableName}
            onChange={(e) => setFilters({ ...filters, tableName: e.target.value })}
            className="w-64"
          />

          <Select
            value={filters.limit.toString()}
            onValueChange={(value) => setFilters({ ...filters, limit: parseInt(value) })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50 logs</SelectItem>
              <SelectItem value="100">100 logs</SelectItem>
              <SelectItem value="200">200 logs</SelectItem>
              <SelectItem value="500">500 logs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Audit Logs Table */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading audit logs...</div>
        ) : (
          <DataTable
            data={logs}
            columns={columns}
            emptyMessage="No audit logs found"
            searchable={false}
            pageSize={50}
          />
        )}
      </div>
    </AdminLayout>
  );
}
