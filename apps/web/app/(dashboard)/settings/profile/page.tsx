'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';
import { User, Camera, CheckCircle, Spinner, PencilSimple, X } from '@phosphor-icons/react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: string;
  profile: {
    displayName: string | null;
    avatar: string | null;
  } | null;
}

export default function ProfileSettingsPage() {
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Fetch user data from API
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await apiFetch('/api/v1/users/me');
        const data = await res.json();
        if (data.success && data.data) {
          setUser(data.data);
          setDisplayName(data.data.profile?.displayName || data.data.name || '');
          setEmail(data.data.email || '');
          setAvatar(data.data.profile?.avatar || data.data.image || '');
        }
      } catch {
        // Fallback to session data
        if (session?.user) {
          setDisplayName(session.user.name || '');
          setEmail(session.user.email || '');
          setAvatar(session.user.image || '');
        }
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [session]);

  // Handle avatar upload
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiFetch('/api/v1/uploads/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.data.fileUrl) {
        setAvatar(data.data.fileUrl);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  // Handle profile save
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await apiFetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, avatar }),
      });
      const data = await res.json();

      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  // Generate initials for fallback avatar
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and public profile.</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and public profile.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Avatar Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName || 'Profile'}
                  className="h-20 w-20 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="h-20 w-20 rounded-full gradient-accent flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
              )}

              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                {uploading ? (
                  <Spinner className="h-6 w-6 text-white animate-spin" weight="bold" />
                ) : (
                  <Camera className="h-6 w-6 text-white" weight="bold" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div>
              <p className="font-medium">{displayName || 'No name set'}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {uploading ? 'Uploading...' : 'Hover over the photo and click to update'}
              </p>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 mt-1">
                  <CheckCircle className="h-4 w-4" weight="fill" />
                  Saved!
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your name and profile details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <><Spinner className="mr-2 h-4 w-4 animate-spin" weight="bold" /> Saving...</>
                ) : (
                  'Save changes'
                )}
              </Button>
              {saved && !saving && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" weight="fill" />
                  Saved!
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Read-only information about your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-muted-foreground">Email Status</Label>
                <p className="text-sm mt-1">
                  {user?.emailVerified || session?.user?.emailVerified ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" weight="fill" /> Verified
                    </span>
                  ) : (
                    <span className="text-yellow-600">Not verified</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-muted-foreground">Member since</Label>
                <p className="text-sm mt-1">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-muted-foreground">User ID</Label>
                <p className="text-sm mt-1 font-mono text-xs">
                  {user?.id || session?.user?.id || 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
