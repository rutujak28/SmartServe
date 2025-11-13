import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Settings as SettingsIcon,
  QrCode,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface CanteenProfile {
  id: string;
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  is_active: boolean;
  opening_hours: any;
}

export default function Settings() {
  const [profile, setProfile] = useState<CanteenProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrTableNumber, setQrTableNumber] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCanteenProfile();
  }, []);

  const fetchCanteenProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('canteens')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
      } else {
        // Create default canteen if none exists
        const { data: newData, error: createError } = await supabase
          .from('canteens')
          .insert({
            name: 'SmartServe Canteen',
            description: 'Your smart dining experience',
            is_active: true,
          })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newData);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load canteen profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('canteens')
        .update({
          name: profile.name,
          description: profile.description,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          logo_url: profile.logo_url,
          is_active: profile.is_active,
          opening_hours: profile.opening_hours,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (url: string) => {
    if (profile) {
      setProfile({ ...profile, logo_url: url });
    }
  };

const generateQRUrl = () => {
  if (!qrTableNumber) return '';
  // Use your permanent production domain
  const baseUrl = "https://smart-serve-three.vercel.app";
  return `${baseUrl}/scan/${qrTableNumber}`;
};



  if (loading) {
    return (
      <AdminLayout
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Settings' },
        ]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Settings' },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure canteen profile and system preferences.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">
              <Building2 className="w-4 h-4 mr-2" />
              Canteen Profile
            </TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode className="w-4 h-4 mr-2" />
              QR Code Generator
            </TabsTrigger>
            <TabsTrigger value="system">
              <SettingsIcon className="w-4 h-4 mr-2" />
              System Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <Label>Canteen Logo</Label>
                  <div className="mt-2">
                    <ImageUpload
                      onUploadComplete={handleLogoUpload}
                      currentImageUrl={profile?.logo_url || undefined}
                      bucket="canteen-logos"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Canteen Name</Label>
                    <Input
                      id="name"
                      value={profile?.name || ''}
                      onChange={(e) =>
                        setProfile(profile ? { ...profile, name: e.target.value } : null)
                      }
                      placeholder="Enter canteen name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={profile?.email || ''}
                        onChange={(e) =>
                          setProfile(profile ? { ...profile, email: e.target.value } : null)
                        }
                        placeholder="contact@canteen.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-10"
                        value={profile?.phone || ''}
                        onChange={(e) =>
                          setProfile(profile ? { ...profile, phone: e.target.value } : null)
                        }
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="address"
                        className="pl-10"
                        value={profile?.address || ''}
                        onChange={(e) =>
                          setProfile(profile ? { ...profile, address: e.target.value } : null)
                        }
                        placeholder="123 Main St, City"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={profile?.description || ''}
                    onChange={(e) =>
                      setProfile(profile ? { ...profile, description: e.target.value } : null)
                    }
                    placeholder="Tell customers about your canteen..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Canteen Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable online ordering
                    </p>
                  </div>
                  <Switch
                    checked={profile?.is_active || false}
                    onCheckedChange={(checked) =>
                      setProfile(profile ? { ...profile, is_active: checked } : null)
                    }
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={fetchCanteenProfile}>
                    Reset
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Generate Table QR Codes</h3>
                  <p className="text-sm text-muted-foreground">
                    Create QR codes for customer table access
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="tableNumber">Table Number</Label>
                    <Input
                      id="tableNumber"
                      value={qrTableNumber}
                      onChange={(e) => setQrTableNumber(e.target.value)}
                      placeholder="Enter table number (e.g., T1, T2)"
                    />
                  </div>
                </div>

                {qrTableNumber && (
                  <div className="border rounded-lg p-6 bg-white flex flex-col items-center gap-4">
                    <QRCodeCanvas value={generateQRUrl()} size={256} level="H" />
                    <p className="text-sm font-medium">Table {qrTableNumber}</p>
                    <p className="text-xs text-muted-foreground break-all text-center max-w-md">
                      {generateQRUrl()}
                    </p>
                    <Button
                      onClick={() => {
                        const canvas = document.querySelector('canvas');
                        if (canvas) {
                          const url = canvas.toDataURL('image/png');
                          const link = document.createElement('a');
                          link.download = `table-${qrTableNumber}-qr.png`;
                          link.href = url;
                          link.click();
                        }
                      }}
                    >
                      Download QR Code
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">System Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced system settings and preferences
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable customer ordering
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send email notifications for orders
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Real-time Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable live order status updates
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
