import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { User, CreditCard, Settings, HelpCircle, LogOut, Moon, Sun, Edit2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Profile() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [editedProfile, setEditedProfile] = useState(profile);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const profileData = {
      fullName: data?.full_name || '',
      email: user.email || '',
      phone: data?.phone || '',
    };

    setProfile(profileData);
    setEditedProfile(profileData);
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateProfile({
      full_name: editedProfile.fullName,
      phone: editedProfile.phone
    });
    
    if (!error) {
      setProfile(editedProfile);
      setIsEditing(false);
    }
    
    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={isEditing ? editedProfile.fullName : profile.fullName}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, fullName: e.target.value })
                }
                disabled={!isEditing}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={isEditing ? editedProfile.phone : profile.phone}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, phone: e.target.value })
                }
                disabled={!isEditing}
                className="mt-2"
              />
            </div>
            {isEditing && (
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your saved payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <CreditCard className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              No payment methods saved yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
            <CardDescription>Customize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark theme
                  </p>
                </div>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Help & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ & Help Center
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Terms & Conditions
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Privacy Policy
            </Button>
          </CardContent>
        </Card>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full" size="lg">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
              <AlertDialogDescription>
                You'll need to log in again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
