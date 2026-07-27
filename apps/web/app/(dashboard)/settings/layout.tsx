'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  CreditCard,
  Users,
  Buildings,
  Bell,
  FileText,
  GearSix,
  Lock,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const settingsNav = [
  { to: '/settings/profile', icon: User, label: 'Profile' },
  { to: '/settings/account', icon: Lock, label: 'Security' },
  { to: '/settings/billing', icon: CreditCard, label: 'Subscription' },
  { to: '/settings/workspace', icon: Buildings, label: 'Workspace' },
  { to: '/settings/team', icon: Users, label: 'Members' },
  { to: '/settings/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings/legal', icon: FileText, label: 'Terms & Privacy' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Settings</h2>
        <p className="text-[13px] text-[#8A8A85] mt-0.5">Manage your account and workspace</p>
      </div>

      <div className="sub-nav overflow-x-auto">
        {settingsNav.map((item) => {
          const isActive = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              href={item.to}
              className={cn('sub-nav-item', isActive && 'active')}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div>
        {children}
      </div>
    </div>
  );
}
