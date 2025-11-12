import { supabase } from '@/integrations/supabase/client';
import { Payment } from '@/lib/types/database';

export const paymentService = {
  async getPayments(userId?: string) {
    let query = supabase
      .from('payments')
      .select(`
        *,
        order:orders(*)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as Payment[];
  },

  async getPayment(paymentId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        order:orders(*)
      `)
      .eq('id', paymentId)
      .single();
    
    if (error) throw error;
    return data as Payment;
  },

  async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  },

  async updatePaymentStatus(paymentId: string, status: Payment['payment_status']) {
    const { data, error } = await supabase
      .from('payments')
      .update({ payment_status: status })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  },

  async processRefund(paymentId: string, refundAmount: number, reason: string) {
    const { data, error } = await supabase
      .from('payments')
      .update({
        payment_status: 'refunded',
        refund_amount: refundAmount,
        refund_reason: reason,
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  },

  async getPaymentsByStatus(status: Payment['payment_status']) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        order:orders(*)
      `)
      .eq('payment_status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Payment[];
  },
};
