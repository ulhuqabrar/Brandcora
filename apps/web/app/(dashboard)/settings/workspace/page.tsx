'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import {
  Buildings,
  Globe,
  Link,
  CheckCircle,
  Warning,
  Trash,
} from '@phosphor-icons/react';

export default function WorkspaceSettingsPage() {
  const [name, setName] = useState('My Workspace');
  const [slug, setSlug] = useState('my-workspace');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/api/v1/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, website }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Workspace</h1>
        <p className="text-muted-foreground">Manage your workspace settings and configuration.</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Buildings className="h-5 w-5 text-muted-foreground" weight="bold" />
            General
          </CardTitle>
          <CardDescription>Basic workspace information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Workspace"
              />
              <p className="text-xs text-muted-foreground">
                This is your workspace's visible name within the app.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Workspace Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">brandguard.io/w/</span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="my-workspace"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Used in URLs. Only lowercase letters, numbers, and hyphens.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Company Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save changes'}
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" weight="fill" />
                  Saved!
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-muted-foreground" weight="bold" />
            API Access
          </CardTitle>
          <CardDescription>Manage API keys for programmatic access.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-lg">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Production Key</p>
                <p className="text-xs text-muted-foreground font-mono">bg_prod_••••••••••••••••</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Regenerate</Button>
                <Button variant="ghost" size="sm">
                  <Trash className="h-4 w-4 text-destructive" weight="bold" />
                </Button>
              </div>
            </div>
            <Button variant="outline" size="sm">
              + Create new key
            </Button>
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
          <CardDescription>Irreversible actions for your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between max-w-lg">
            <div>
              <p className="font-medium text-sm">Delete Workspace</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete this workspace and all its data.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
