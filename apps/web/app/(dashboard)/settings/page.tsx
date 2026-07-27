'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  ShieldCheck,
  CreditCard,
  House,
  Users,
  Bell,
  FileText,
  ArrowRight,
  CheckCircle,
  PencilSimple,
  Trash,
  Envelope,
  Lock,
  Key,
  Globe,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const SETTINGS_NAV = [
  { to: '/settings', label: 'Profile', icon: User },
  { to: '/settings/security', label: 'Security', icon: ShieldCheck },
  { to: '/settings/subscription', label: 'Subscription', icon: CreditCard },
  { to: '/settings/workspace', label: 'Workspace', icon: House },
  { to: '/settings/members', label: 'Members', icon: Users },
  { to: '/settings/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings/terms', label: 'Terms & Privacy', icon: FileText },
];

export default function SettingsPage() {
  const pathname = usePathname();
  const [name, setName] = useState('Sajibur');
  const [email, setEmail] = useState('sajibur@seocontent.ai');
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
          <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Profile</h2>
          <p className="text-[13px] text-[#8A8A85] mt-0.5">Manage your personal information</p>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="dash-card">
        <div className="dash-card-title mb-4">Personal information</div>
        <div className="space-y-4 max-w-[480px]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#1A1918] text-white flex items-center justify-center text-[18px] font-bold">
              {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <button className="btn-secondary text-[12px]">
                <PencilSimple className="h-3.5 w-3.5" weight="bold" /> Change photo
              </button>
              <p className="text-[11px] text-[#8A8A85] mt-1">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#3D3D3A] mb-1.5 block">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-compact"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#3D3D3A] mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

      {/* Password */}
      <div className="dash-card">
        <div className="dash-card-title mb-4">Password</div>
        <div className="space-y-3 max-w-[480px]">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-[#8A8A85]" weight="bold" />
              <div>
                <div className="text-[13px] font-medium text-[#1A1918]">Password</div>
                <div className="text-[12px] text-[#8A8A85]">Last changed 3 months ago</div>
              </div>
            </div>
            <button className="btn-ghost text-[12px]">
              Change <ArrowRight className="h-3 w-3" weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="dash-card">
        <div className="dash-card-title mb-4 text-[#DC2626]">Danger zone</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium text-[#1A1918]">Delete account</div>
            <div className="text-[12px] text-[#8A8A85]">Permanently delete your account and all data</div>
          </div>
          <button className="btn-ghost text-[12px] text-[#DC2626]">
            <Trash className="h-3.5 w-3.5" weight="bold" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
