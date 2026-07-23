'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import {
  FileText,
  ShieldCheck,
  Trash,
  Warning,
  ArrowRight,
  CheckCircle,
  ArrowSquareOut,
} from '@phosphor-icons/react';
import { useAuth } from '@/lib/auth-context';

export default function LegalSettingsPage() {
  const { signOut } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAccount() {
    if (deleteText !== 'DELETE') return;
    setDeleting(true);
    try {
      await apiFetch('/api/v1/users/me', { method: 'DELETE' });
      await signOut();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Terms & Privacy</h1>
        <p className="text-muted-foreground">Legal documents and data management.</p>
      </div>

      {/* Legal Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" weight="bold" />
            Legal Documents
          </CardTitle>
          <CardDescription>Review our legal policies and terms.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-lg">
            <a
              href="/terms"
              target="_blank"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" weight="bold" />
                <div>
                  <p className="text-sm font-medium">Terms of Service</p>
                  <p className="text-xs text-muted-foreground">Last updated: January 1, 2026</p>
                </div>
              </div>
              <ArrowSquareOut className="h-4 w-4 text-muted-foreground" weight="bold" />
            </a>
            <a
              href="/privacy"
              target="_blank"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" weight="bold" />
                <div>
                  <p className="text-sm font-medium">Privacy Policy</p>
                  <p className="text-xs text-muted-foreground">Last updated: January 1, 2026</p>
                </div>
              </div>
              <ArrowSquareOut className="h-4 w-4 text-muted-foreground" weight="bold" />
            </a>
            <a
              href="/cookies"
              target="_blank"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" weight="bold" />
                <div>
                  <p className="text-sm font-medium">Cookie Policy</p>
                  <p className="text-xs text-muted-foreground">Last updated: January 1, 2026</p>
                </div>
              </div>
              <ArrowSquareOut className="h-4 w-4 text-muted-foreground" weight="bold" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" weight="bold" />
            Data & Privacy
          </CardTitle>
          <CardDescription>Manage your personal data and privacy settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Export your data</p>
                <p className="text-xs text-muted-foreground">Download all your data in JSON format</p>
              </div>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Request data deletion</p>
                <p className="text-xs text-muted-foreground">Request removal of all your personal data</p>
              </div>
              <Button variant="outline" size="sm">
                Request
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Warning className="h-5 w-5" weight="bold" />
            Danger Zone
          </CardTitle>
          <CardDescription>Permanently delete your account and all associated data.</CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between max-w-lg">
              <div>
                <p className="font-medium text-sm">Delete Account</p>
                <p className="text-xs text-muted-foreground">
                  This action is irreversible. All your data will be permanently deleted.
                </p>
              </div>
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                Delete account
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-w-lg">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <Warning className="h-5 w-5 text-destructive mt-0.5" weight="fill" />
                  <div>
                    <p className="font-medium text-sm text-destructive">Are you absolutely sure?</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This will permanently delete your account, all brand profiles, scan history,
                      and billing information. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Type <span className="font-mono font-bold">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="Type DELETE"
                  className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  disabled={deleteText !== 'DELETE' || deleting}
                  onClick={handleDeleteAccount}
                >
                  {deleting ? 'Deleting...' : 'Permanently delete account'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteText('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
