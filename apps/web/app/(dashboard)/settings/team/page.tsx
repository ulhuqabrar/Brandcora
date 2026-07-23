'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import {
  Users,
  Plus,
  Trash,
  Crown,
  User,
  Envelope,
  Copy,
  CheckCircle,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'invited';
  joinedAt: string;
}

export default function TeamSettingsPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const members: TeamMember[] = [
    {
      id: '1',
      name: 'Admin',
      email: 'admin@brandguard.io',
      role: 'owner',
      status: 'active',
      joinedAt: '2026-01-15',
    },
  ];

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/api/v1/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      setEmail('');
      setRole('member');
    } finally {
      setLoading(false);
    }
  }

  function copyInviteLink() {
    navigator.clipboard.writeText('https://brandguard.io/invite/abc123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const roleColors = {
    owner: 'bg-purple-100 text-purple-700',
    admin: 'bg-blue-100 text-blue-700',
    member: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-muted-foreground">Manage your team members and invitations.</p>
      </div>

      {/* Invite Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-muted-foreground" weight="bold" />
            Invite Member
          </CardTitle>
          <CardDescription>Send an invitation to join your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex items-end gap-4 max-w-lg">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
              />
            </div>
            <div className="w-36 space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send invite'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" weight="bold" />
            Team Members
          </CardTitle>
          <CardDescription>{members.length} member{members.length !== 1 ? 's' : ''} in this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" weight="bold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{member.name}</p>
                      {member.role === 'owner' && (
                        <Crown className="h-4 w-4 text-yellow-500" weight="fill" />
                      )}
                      <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", roleColors[member.role])}>
                        {member.role}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Envelope className="h-5 w-5 text-muted-foreground" weight="bold" />
            Pending Invitations
          </CardTitle>
          <CardDescription>Manage outstanding invitations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Envelope className="h-6 w-6 text-muted-foreground" weight="bold" />
            </div>
            <h3 className="text-sm font-medium">No pending invitations</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Invited members will appear here until they accept.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Team Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Understand what each role can do.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-yellow-500" weight="fill" />
                <span className="font-medium text-sm">Owner</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>Full access to all features</li>
                <li>Manage billing and subscriptions</li>
                <li>Add/remove team members</li>
                <li>Delete workspace</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" weight="bold" />
                <span className="font-medium text-sm">Admin</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>Manage brand profiles</li>
                <li>Run scans and view reports</li>
                <li>Invite team members</li>
                <li>Cannot manage billing</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-500" weight="bold" />
                <span className="font-medium text-sm">Member</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>View brand profiles</li>
                <li>Run scans and view reports</li>
                <li>Cannot manage team</li>
                <li>Cannot manage billing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
