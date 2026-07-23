'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';
import {
  Lock,
  ShieldCheck,
  Key,
  GithubLogo,
  GoogleLogo,
  AppleLogo,
  CheckCircle,
  Warning,
  Plus,
  Trash,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export default function AccountSettingsPage() {
  const { user, signOut, signInSocial } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to change password');
      }
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  }

  const connectedAccounts = [
    { provider: 'github', name: 'GitHub', icon: GithubLogo, connected: false },
    { provider: 'google', name: 'Google', icon: GoogleLogo, connected: false },
    { provider: 'apple', name: 'Apple', icon: AppleLogo, connected: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-muted-foreground">Manage your password, 2FA, and connected accounts.</p>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-muted-foreground" weight="bold" />
            Change Password
          </CardTitle>
          <CardDescription>Ensure your account stays secure with a strong password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            {passwordError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <Warning className="h-4 w-4" weight="fill" />
                {passwordError}
              </div>
            )}
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? 'Updating...' : 'Update password'}
              </Button>
              {passwordSaved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" weight="fill" />
                  Password updated!
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" weight="bold" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between max-w-lg">
            <div>
              <p className="font-medium">
                {twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {twoFactorEnabled
                  ? 'Your account is protected with an authenticator app.'
                  : 'Use an authenticator app to generate one-time codes.'}
              </p>
            </div>
            <Button
              variant={twoFactorEnabled ? 'destructive' : 'default'}
              onClick={() => {
                if (twoFactorEnabled) {
                  setTwoFactorEnabled(false);
                } else {
                  setShowTwoFactorSetup(true);
                }
              }}
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
          {showTwoFactorSetup && !twoFactorEnabled && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50 border max-w-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="h-32 w-32 bg-background rounded-lg flex items-center justify-center mb-3">
                <p className="text-xs text-muted-foreground">QR Code</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { setTwoFactorEnabled(true); setShowTwoFactorSetup(false); }}>
                  Confirm
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowTwoFactorSetup(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-muted-foreground" weight="bold" />
            Connected Accounts
          </CardTitle>
          <CardDescription>Link your social accounts for easy sign-in.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-lg">
            {connectedAccounts.map((account) => {
              const Icon = account.icon;
              return (
                <div key={account.provider} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" weight="bold" />
                    <div>
                      <p className="font-medium text-sm">{account.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {account.connected ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={account.connected ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (!account.connected) {
                        signInSocial(account.provider as any, '/settings/account');
                      }
                    }}
                  >
                    {account.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" weight="bold" />
            Active Sessions
          </CardTitle>
          <CardDescription>Manage your active login sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-lg">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div>
                <p className="font-medium text-sm">Current Session</p>
                <p className="text-xs text-muted-foreground">Chrome on Windows</p>
              </div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="destructive" size="sm" onClick={signOut}>
              Sign out of all sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
