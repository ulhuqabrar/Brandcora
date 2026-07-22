'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  TrendUp,
  Palette,
  MagnifyingGlass,
  Lightning,
  ChartBar,
  ShieldCheck,
} from '@phosphor-icons/react';

const MOCK_DATA = {
  brandProfile: { id: 'demo-1', name: 'My Brand' },
  plan: 'free',
  usage: {
    socialChecks: { used: 3, limit: 3 },
    websiteScans: { used: 1, limit: 1 },
  },
  recentScans: [
    {
      id: 'scan-1',
      scanType: 'social',
      overallScore: 82,
      platform: 'instagram-post',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      brandProfile: { name: 'My Brand' },
    },
    {
      id: 'scan-2',
      scanType: 'website',
      overallScore: 65,
      platform: null,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      brandProfile: { name: 'My Brand' },
    },
  ],
  stats: {
    totalScans: 5,
    averageScore: 74,
    topIssues: [
      { category: 'color', count: 3 },
      { category: 'font', count: 1 },
    ],
  },
};

export default function DashboardPage() {
  const data = MOCK_DATA;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">
            Welcome back, {data.brandProfile.name}
          </h1>
          <p className="text-muted-foreground mt-1 whitespace-nowrap">
            Keep every design on-brand.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="gradient-accent text-white shadow-glass">
            <Link href="/scans/new-social">
              <Plus className="mr-1.5 h-4 w-4" weight="bold" />
              New social check
            </Link>
          </Button>
          <Button variant="outline" asChild className="glass">
            <Link href="/scans/new-website">
              <MagnifyingGlass className="mr-1.5 h-4 w-4" weight="bold" />
              New website check
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="glass-strong rounded-2xl p-6 shadow-glass">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
            <ShieldCheck className="h-6 w-6 text-primary" weight="bold" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Your brand profile is ready</h3>
            <p className="text-sm text-muted-foreground">
              Run a check to see how your designs score against your brand guidelines.
            </p>
          </div>
          <Button size="sm" variant="outline" asChild className="glass shrink-0">
            <Link href="/brand">Edit brand profile</Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-strong rounded-2xl p-5 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Lightning className="h-5 w-5 text-primary" weight="bold" />
            </div>
            <p className="text-sm text-muted-foreground">Current plan</p>
          </div>
          <div className="text-2xl font-extrabold capitalize">{data.plan}</div>
          <Button size="sm" className="mt-3" variant="outline" asChild>
            <Link href="/pricing">Upgrade</Link>
          </Button>
        </div>

        <div className="glass-strong rounded-2xl p-5 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <MagnifyingGlass className="h-5 w-5 text-primary" weight="bold" />
            </div>
            <p className="text-sm text-muted-foreground">Total scans</p>
          </div>
          <div className="text-2xl font-extrabold">{data.stats.totalScans}</div>
        </div>

        <div className="glass-strong rounded-2xl p-5 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <TrendUp className="h-5 w-5 text-primary" weight="bold" />
            </div>
            <p className="text-sm text-muted-foreground">Average score</p>
          </div>
          <div className="text-2xl font-extrabold text-green-600">
            {data.stats.averageScore}
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-5 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ChartBar className="h-5 w-5 text-primary" weight="bold" />
            </div>
            <p className="text-sm text-muted-foreground">Top issue</p>
          </div>
          <div className="text-2xl font-extrabold capitalize">
            {data.stats.topIssues[0]?.category || 'None'}
          </div>
        </div>
      </div>

      {/* Usage + Recent */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-strong rounded-2xl p-6 shadow-glass">
          <h3 className="text-lg font-semibold mb-4">Usage this month</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Social checks</span>
                <span className="text-muted-foreground">
                  {data.usage.socialChecks.used} / {data.usage.socialChecks.limit}
                </span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full gradient-accent rounded-full"
                  style={{ width: `${(data.usage.socialChecks.used / data.usage.socialChecks.limit) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Website scans</span>
                <span className="text-muted-foreground">
                  {data.usage.websiteScans.used} / {data.usage.websiteScans.limit}
                </span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full gradient-accent rounded-full"
                  style={{ width: `${(data.usage.websiteScans.used / data.usage.websiteScans.limit) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free plan includes 3 social checks and 1 website scan per month.
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-6 shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Reports</h3>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/scans">View all</Link>
            </Button>
          </div>
          {data.recentScans.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No reports yet.</p>
          ) : (
            <div className="space-y-2">
              {data.recentScans.map((scan) => (
                <Link
                  key={scan.id}
                  href={`/scans/${scan.id}`}
                  className="flex items-center justify-between rounded-xl border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={scan.scanType === 'social' ? 'default' : 'secondary'}>
                        {scan.scanType}
                      </Badge>
                      {scan.platform && (
                        <span className="text-xs text-muted-foreground">{scan.platform}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-lg font-extrabold ${
                      (scan.overallScore ?? 0) >= 80
                        ? 'text-green-600'
                        : (scan.overallScore ?? 0) >= 60
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {scan.overallScore ?? '—'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
