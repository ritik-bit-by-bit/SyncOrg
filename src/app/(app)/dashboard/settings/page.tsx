'use client';

import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { ApiResponse } from '@/types/ApiResponse';
import { Settings, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    defaultTheme: 'default',
    analyticsOptIn: true,
    emailNotifications: false,
    qaModeEnabled: false
  });

  useEffect(() => {
    if (session) {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/settings/get');
      if (response.data.success && response.data.data) {
        const fetchedSettings = response.data.data.settings || {
          defaultTheme: 'default',
          analyticsOptIn: true,
          emailNotifications: false
        };
        setSettings({
          defaultTheme: fetchedSettings.defaultTheme || 'default',
          analyticsOptIn: fetchedSettings.analyticsOptIn !== undefined ? fetchedSettings.analyticsOptIn : true,
          emailNotifications: fetchedSettings.emailNotifications !== undefined ? fetchedSettings.emailNotifications : false,
          qaModeEnabled: response.data.data.qaModeEnabled || false
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.error('Settings fetch error:', axiosError);
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.post<ApiResponse>('/api/settings/update', settings);
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Settings saved successfully',
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return <div></div>;
  }

  return (
    <div className="w-full p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Settings
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-600">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 text-xl font-semibold">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-gray-900 font-medium">Analytics</Label>
                    <p className="text-sm text-gray-600 mt-1">Allow analytics tracking</p>
                  </div>
                  <Switch
                    checked={settings.analyticsOptIn}
                    onCheckedChange={(checked) => setSettings({...settings, analyticsOptIn: checked})}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                <div className="border-t border-gray-200"></div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-gray-900 font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-600 mt-1">Receive email notifications for new messages</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2 rounded-lg shadow-sm hover:shadow transition-all"
              >
                {saving ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

