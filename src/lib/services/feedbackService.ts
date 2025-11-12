import { supabase } from '@/integrations/supabase/client';
import { Feedback, FeedbackWithUser } from '@/lib/types/database';

export const feedbackService = {
  async getFeedback(filters?: { rating?: number; hasResponse?: boolean }) {
    let query = supabase
      .from('feedback')
      .select(`
        *,
        order:orders(*),
        user:profiles(full_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (filters?.rating) {
      query = query.eq('rating', filters.rating);
    }

    if (filters?.hasResponse !== undefined) {
      if (filters.hasResponse) {
        query = query.not('admin_response', 'is', null);
      } else {
        query = query.is('admin_response', null);
      }
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as FeedbackWithUser[];
  },

  async createFeedback(feedback: Omit<Feedback, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedback])
      .select()
      .single();

    if (error) throw error;
    return data as Feedback;
  },

  async respondToFeedback(feedbackId: string, response: string) {
    const { data, error } = await supabase
      .from('feedback')
      .update({ admin_response: response })
      .eq('id', feedbackId)
      .select()
      .single();

    if (error) throw error;
    return data as Feedback;
  },

  async incrementHelpfulCount(feedbackId: string) {
    // Get current count and increment
    const { data: currentData, error: fetchError } = await supabase
      .from('feedback')
      .select('is_helpful_count')
      .eq('id', feedbackId)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('feedback')
      .update({ is_helpful_count: (currentData.is_helpful_count || 0) + 1 })
      .eq('id', feedbackId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAverageRating() {
    const { data, error } = await supabase
      .from('feedback')
      .select('rating');

    if (error) throw error;
    
    if (!data || data.length === 0) return 0;
    
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / data.length;
  },

  async getRatingDistribution() {
    const { data, error } = await supabase
      .from('feedback')
      .select('rating');

    if (error) throw error;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data?.forEach((item) => {
      distribution[item.rating as keyof typeof distribution]++;
    });

    return distribution;
  },
};
