import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/admin/charts/MetricCard';
import { BarChart } from '@/components/admin/charts/BarChart';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Search, MessageSquare, ThumbsUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/admin/Modal';
import { Label } from '@/components/ui/label';
import { feedbackService } from '@/lib/services/feedbackService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Mock data
const mockFeedback = [
  { id: '1', customer: 'John Doe', orderId: 'ORD001', rating: 5, comment: 'Excellent food and fast service!', date: '2024-01-15', replied: false, helpful: 12 },
  { id: '2', customer: 'Jane Smith', orderId: 'ORD002', rating: 4, comment: 'Good taste, portion size could be better.', date: '2024-01-15', replied: true, helpful: 8 },
  { id: '3', customer: 'Bob Johnson', orderId: 'ORD003', rating: 5, comment: 'Best biryani in town! Will definitely order again.', date: '2024-01-14', replied: false, helpful: 15 },
  { id: '4', customer: 'Alice Brown', orderId: 'ORD004', rating: 3, comment: 'Average experience. Food was cold when delivered.', date: '2024-01-14', replied: true, helpful: 5 },
  { id: '5', customer: 'Charlie Wilson', orderId: 'ORD005', rating: 5, comment: 'Amazing quality and presentation!', date: '2024-01-13', replied: false, helpful: 10 },
];

const ratingData = [
  { name: '5 Star', value: 45, color: '#059669' },
  { name: '4 Star', value: 30, color: '#2563eb' },
  { name: '3 Star', value: 15, color: '#f59e0b' },
  { name: '2 Star', value: 7, color: '#dc2626' },
  { name: '1 Star', value: 3, color: '#64748b' },
];

export default function FeedbackPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<any>({});

  useEffect(() => {
    loadFeedback();
    loadStats();
    
    // Real-time subscription for new feedback
    const channel = supabase
      .channel('feedback-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback'
      }, () => {
        loadFeedback();
        loadStats();
        toast.success('New feedback received!');
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'feedback'
      }, () => {
        loadFeedback();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadFeedback = async () => {
    try {
      const data = await feedbackService.getFeedback();
      setFeedback(data);
    } catch (error) {
      console.error('Error loading feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [avg, distribution] = await Promise.all([
        feedbackService.getAverageRating(),
        feedbackService.getRatingDistribution()
      ]);
      setAvgRating(avg);
      setRatingDistribution(distribution);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filteredFeedback = feedback.filter((item) => {
    const customerName = item.user?.full_name || 'Anonymous';
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.review_text?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || item.rating === parseInt(ratingFilter);
    return matchesSearch && matchesRating;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
    );
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedFeedback) return;
    
    try {
      await feedbackService.respondToFeedback(selectedFeedback.id, replyText);
      toast.success('Reply sent successfully!');
      setSelectedFeedback(null);
      setReplyText('');
      loadFeedback();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const ratingData = [
    { name: '5 Star', value: ratingDistribution[5] || 0, color: '#059669' },
    { name: '4 Star', value: ratingDistribution[4] || 0, color: '#2563eb' },
    { name: '3 Star', value: ratingDistribution[3] || 0, color: '#f59e0b' },
    { name: '2 Star', value: ratingDistribution[2] || 0, color: '#dc2626' },
    { name: '1 Star', value: ratingDistribution[1] || 0, color: '#64748b' },
  ];

  if (loading) {
    return (
      <AdminLayout breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Feedback' }]}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  const totalReviews = feedback.length;
  const unrepliedCount = feedback.filter(f => !f.admin_response).length;

  return (
    <AdminLayout breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Feedback' }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
          <p className="text-muted-foreground mt-2">
            View and respond to customer reviews and ratings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Average Rating"
            value={avgRating.toFixed(1)}
            icon={Star}
            trendLabel={`Based on ${totalReviews} reviews`}
          />
          <MetricCard
            title="Total Reviews"
            value={totalReviews.toString()}
            icon={MessageSquare}
            trendLabel="Customer feedback"
          />
          <MetricCard
            title="Pending Replies"
            value={unrepliedCount.toString()}
            icon={MessageSquare}
            trendLabel="Requires response"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {filteredFeedback.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No feedback found
                </div>
              ) : (
                filteredFeedback.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {item.user?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{item.user?.full_name || 'Anonymous'}</p>
                            <p className="text-sm text-muted-foreground">Order #{item.order_id?.slice(0, 8)}</p>
                          </div>
                          <div className="text-right">
                            {renderStars(item.rating)}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {item.review_text && (
                          <p className="text-sm mb-3">{item.review_text}</p>
                        )}
                        {item.admin_response && (
                          <div className="mt-3 p-3 bg-muted rounded-lg mb-3">
                            <Badge variant="secondary" className="gap-1 mb-2">
                              <MessageSquare className="w-3 h-3" />
                              Admin Reply
                            </Badge>
                            <p className="text-sm">{item.admin_response}</p>
                          </div>
                        )}
                        <div className="flex gap-2 items-center">
                          <Button size="sm" variant="outline" className="gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {item.is_helpful_count || 0}
                          </Button>
                          {!item.admin_response ? (
                            <Button size="sm" onClick={() => setSelectedFeedback(item)}>
                              Reply
                            </Button>
                          ) : (
                            <Badge variant="secondary">Replied</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
            <BarChart 
              data={ratingData} 
              xKey="name"
              bars={[
                { key: 'value', color: '#2563eb', name: 'Count' }
              ]}
            />
            <div className="mt-6 space-y-3">
              {ratingData.map((rating) => {
                const values = Object.values(ratingDistribution) as number[];
                const total = values.reduce((sum, val) => sum + val, 0);
                const percentage = total > 0 ? Math.round((rating.value / total) * 100) : 0;
                return (
                  <div key={rating.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{rating.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: rating.color }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">{rating.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={!!selectedFeedback}
        onClose={() => {
          setSelectedFeedback(null);
          setReplyText('');
        }}
        title="Reply to Review"
      >
        {selectedFeedback && (
          <div className="space-y-4">
            <Card className="p-4 bg-muted">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedFeedback.user?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{selectedFeedback.user?.full_name || 'Anonymous'}</p>
                  {renderStars(selectedFeedback.rating)}
                  {selectedFeedback.review_text && (
                    <p className="text-sm mt-2">{selectedFeedback.review_text}</p>
                  )}
                </div>
              </div>
            </Card>

            <div>
              <Label htmlFor="reply">Your Response</Label>
              <Textarea
                id="reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Thank you for your feedback..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setSelectedFeedback(null);
                setReplyText('');
              }}>
                Cancel
              </Button>
              <Button onClick={handleReply} disabled={!replyText.trim()}>
                Send Reply
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
