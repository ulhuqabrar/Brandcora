'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GearSix,
  House,
  Users,
  Fingerprint,
  Plugs,
  Download,
  Bell,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  CheckCircle,
  Warning,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const SETTINGS_NAV = [
  { to: '/settings', label: 'Workspace', icon: House },
  { to: '/settings/team', label: 'Team', icon: Users },
  { to: '/settings/brand-defaults', label: 'Brand defaults', icon: Fingerprint },
  { to: '/settings/integrations', label: 'Integrations', icon: Plugs },
  { to: '/settings/export', label: 'Export', icon: Download },
  { to: '/settings/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings/security', label: 'Security', icon: ShieldCheck },
  { to: '/settings/billing', label: 'Billing', icon: CreditCard },
];

export default function SettingsPage() {
  const pathname = usePathname();
  const [workspaceName, setWorkspaceName] = useState('Acme Studio');
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState('en');

  const isActive = (to: string) => {
    if (to === '/settings') return pathname === '/settings';
    return pathname.startsWith(to);
  };

  return (
    <div className="space-y-5">
      {/* Sub-navigation */}
      <div className="sub-nav overflow-x-auto">
        {SETTINGS_NAV.map((item) => (
          <Link key={item.to} href={item.to} className={cn('sub-nav-item', isActive(item.to) && 'active')}>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Workspace</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">Manage your workspace settings</p>
        </div>
      </div>

      {/* Workspace Settings */}
      <div className="dash-card">
        <div className="dash-card-title mb-4">General</div>
        <div className="space-y-4 max-w-[480px]">
          <div>
            <label className="text-[12px] font-medium text-[#3D3D3A] mb-1.5 block">Workspace name</label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="input-compact"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#3D3D3A] mb-1.5 block">Timezone</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-compact">
                <option>UTC</option>
                <option>EST</option>
                <option>PST</option>
                <option>CET</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#3D3D3A] mb-1.5 block">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-compact">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
          <button className="btn-primary">
            Save changes
          </button>
        </div>
      </div>

      {/* Data & Storage */}
      <div className="dash-card">
        <div className="dash-card-title mb-4">Data &amp; storage</div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-[13px] font-medium text-[#1A1918]">Data retention</div>
              <div className="text-[12px] text-[#8A8A85]">Keep reports and assets for 90 days</div>
            </div>
            <button className="btn-ghost text-[12px]">
              Change <ArrowRight className="h-3 w-3" weight="bold" />
            </button>
          </div>
          <div className="border-t border-[#F5F5F3] flex items-center justify-between py-2">
            <div>
              <div className="text-[13px] font-medium text-[#DC2626]">Delete workspace</div>
              <div className="text-[12px] text-[#8A8A85]">Permanently delete all data</div>
            </div>
            <button className="btn-ghost text-[12px] text-[#DC2626]">
              <Trash className="h-3.5 w-3.5" weight="bold" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
