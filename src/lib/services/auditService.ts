import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const auditService = {
  /**
   * Fetch audit logs with optional filtering
   */
  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    tableName?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.tableName) {
      query = query.eq('table_name', filters.tableName);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as AuditLog[];
  },

  /**
   * Get audit statistics
   */
  async getAuditStatistics(startDate?: string, endDate?: string) {
    let query = supabase
      .from('audit_logs')
      .select('action, table_name, created_at');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate statistics
    const stats = {
      totalLogs: data?.length || 0,
      insertCount: data?.filter(log => log.action === 'INSERT').length || 0,
      updateCount: data?.filter(log => log.action === 'UPDATE').length || 0,
      deleteCount: data?.filter(log => log.action === 'DELETE').length || 0,
      tableActivity: {} as Record<string, number>,
    };

    // Count activity per table
    data?.forEach(log => {
      stats.tableActivity[log.table_name] = (stats.tableActivity[log.table_name] || 0) + 1;
    });

    return stats;
  },

  /**
   * Clean old audit logs (older than 90 days)
   */
  async cleanOldLogs() {
    const { error } = await supabase.rpc('clean_old_audit_logs');
    if (error) throw error;
    return { success: true };
  },
};
