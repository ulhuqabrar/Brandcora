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
    <div className="flex gap-6">
      <aside className="w-56 shrink-0">
        <div className="sticky top-6">
          <div className="flex items-center gap-2 mb-6">
            <GearSix className="h-5 w-5 text-muted-foreground" weight="bold" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <nav className="space-y-1">
            {settingsNav.map((item) => {
              const isActive = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-accent font-bold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" weight="bold" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
