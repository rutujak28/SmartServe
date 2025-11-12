import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { MetricCard } from '@/components/admin/charts/MetricCard';
import { BarChart } from '@/components/admin/charts/BarChart';
import { DataTable } from '@/components/admin/DataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare, TrendingUp, Users, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIConversation {
  id: string;
  user_id: string;
  session_id: string;
  message: string;
  response: string;
  sentiment: string | null;
  context: any;
  created_at: string;
}

interface ConversationStats {
  total_conversations: number;
  total_messages: number;
  unique_users: number;
  avg_messages_per_session: number;
  most_active_hour: number;
}

interface PopularQuery {
  query_preview: string;
  query_count: number;
  avg_response_length: number;
}

export default function AIInsights() {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [popularQueries, setPopularQueries] = useState<PopularQuery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const fetchAIInsights = async () => {
    try {
      setLoading(true);

      // Fetch conversation stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_ai_conversation_stats' as any);

      if (statsError) throw statsError;
      if (statsData && Array.isArray(statsData) && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // Fetch popular queries
      const { data: queriesData, error: queriesError } = await supabase
        .rpc('get_popular_ai_queries' as any, { limit_count: 10 });

      if (queriesError) throw queriesError;
      if (Array.isArray(queriesData)) {
        setPopularQueries(queriesData);
      }

      // Fetch recent conversations
      const { data: convData, error: convError } = await supabase
        .from('ai_conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (convError) throw convError;
      setConversations(convData || []);
    } catch (error: any) {
      console.error('Error fetching AI insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI insights',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.response.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const conversationColumns = [
    { key: 'message', label: 'User Message' },
    { key: 'response', label: 'AI Response' },
    { key: 'session_id', label: 'Session ID' },
    {
      key: 'created_at',
      label: 'Time',
      cell: (value: string) => new Date(value).toLocaleString(),
    },
  ];

  const queryColumns = [
    { key: 'query_preview', label: 'Query Preview' },
    { key: 'query_count', label: 'Count' },
    { key: 'avg_response_length', label: 'Avg Response Length' },
  ];

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    conversations: i === stats?.most_active_hour ? 45 : Math.floor(Math.random() * 30),
  }));

  return (
    <AdminLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'AI Insights' },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground mt-2">
            Chatbot conversations and AI-powered recommendations analytics.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Conversations"
            value={stats?.total_conversations.toString() || '0'}
            icon={MessageSquare}
            trend={12}
          />
          <MetricCard
            title="Total Messages"
            value={stats?.total_messages.toString() || '0'}
            icon={TrendingUp}
            trend={8}
          />
          <MetricCard
            title="Unique Users"
            value={stats?.unique_users.toString() || '0'}
            icon={Users}
            trend={5}
          />
          <MetricCard
            title="Avg Messages/Session"
            value={stats?.avg_messages_per_session.toFixed(1) || '0'}
            icon={Clock}
          />
        </div>

        <Tabs defaultValue="conversations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="popular">Popular Queries</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={fetchAIInsights} variant="outline">
                  Refresh
                </Button>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {filteredConversations.map((conv) => (
                    <Card key={conv.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">User</p>
                            <p className="text-sm text-muted-foreground">{conv.message}</p>
                          </div>
                        </div>
                        {conv.response && (
                          <div className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">AI Assistant</p>
                              <p className="text-sm text-muted-foreground">{conv.response}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                          <span>Session: {conv.session_id.substring(0, 8)}...</span>
                          <span>{new Date(conv.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="popular" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Most Popular Queries</h3>
              <DataTable
                data={popularQueries}
                columns={queryColumns}
                searchPlaceholder="Search queries..."
              />
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Hourly Conversation Activity</h3>
              <BarChart
                data={hourlyData}
                xKey="hour"
                bars={[{ key: 'conversations', color: '#2563eb', name: 'Conversations' }]}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
