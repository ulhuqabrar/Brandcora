'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, Envelope, CheckCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  inApp: boolean;
}

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'scan-complete',
      label: 'Scan completed',
      description: 'When a brand scan finishes processing',
      email: true,
      inApp: true,
    },
    {
      id: 'compliance-alert',
      label: 'Compliance alerts',
      description: 'When a design violates brand guidelines',
      email: true,
      inApp: true,
    },
    {
      id: 'team-invite',
      label: 'Team invitations',
      description: 'When someone invites you to a workspace',
      email: true,
      inApp: true,
    },
    {
      id: 'billing-update',
      label: 'Billing updates',
      description: 'Payment receipts and subscription changes',
      email: true,
      inApp: false,
    },
    {
      id: 'product-update',
      label: 'Product updates',
      description: 'New features and improvements',
      email: false,
      inApp: true,
    },
    {
      id: 'weekly-report',
      label: 'Weekly summary',
      description: 'A digest of your brand compliance activity',
      email: false,
      inApp: false,
    },
  ]);

  const [saved, setSaved] = useState(false);

  function toggleEmail(id: string) {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, email: !s.email } : s))
    );
  }

  function toggleInApp(id: string) {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, inApp: !s.inApp } : s))
    );
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Choose how and when you want to be notified.</p>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Envelope className="h-5 w-5 text-muted-foreground" weight="bold" />
            Email Notifications
          </CardTitle>
          <CardDescription>Control which emails you receive.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-lg">
            {settings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{setting.label}</p>
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                </div>
                <button
                  onClick={() => toggleEmail(setting.id)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    setting.email ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      setting.email ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" weight="bold" />
            In-App Notifications
          </CardTitle>
          <CardDescription>Control notifications within the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-lg">
            {settings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{setting.label}</p>
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                </div>
                <button
                  onClick={() => toggleInApp(setting.id)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    setting.inApp ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      setting.inApp ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave}>Save preferences</Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" weight="fill" />
            Preferences saved!
          </span>
        )}
      </div>
    </div>
  );
}
