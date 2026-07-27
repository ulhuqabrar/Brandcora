'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Fingerprint,
  FileText,
  GearSix,
  MagnifyingGlass,
  Question,
  Bell,
  List,
  X,
  SignOut,
  House,
} from '@phosphor-icons/react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/protected-route';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: House, label: 'Home' },
  { to: '/brand', icon: Fingerprint, label: 'Brand Identity' },
  { to: '/scans', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: GearSix, label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const currentSection = pathname.startsWith('/brand')
    ? 'Brand Identity'
    : pathname.startsWith('/scans')
    ? 'Reports'
    : pathname.startsWith('/settings')
    ? 'Settings'
    : 'Dashboard';

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <ProtectedRoute>
      <div className="dashboard-page min-h-screen p-6">
        <div className="app-shell">
          {/* Main Content */}
          <div className="main-content">
            {/* Top Utility Bar */}
            <header className="top-bar">
              {/* Mobile menu button */}
              <button
                className="lg:hidden top-bar-action"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
              >
                {mobileNavOpen ? <X className="h-5 w-5" weight="bold" /> : <List className="h-5 w-5" weight="bold" />}
              </button>

              {/* Brand */}
              <div className="top-bar-brand">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#FF5F45] via-[#FF8A5B] to-[#F2B84B] flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">B</span>
                  </div>
                  <span className="top-bar-brand-name">Brandcora</span>
                </Link>
                <span className="top-bar-separator" />
                <div className="top-bar-workspace">
                  <span className="top-bar-workspace-name">Acme Studio</span>
                  <span className="hidden sm:inline text-xs">·</span>
                  <span className="hidden sm:inline text-xs">Approved · 2h ago</span>
                </div>
              </div>

              {/* Center - Nav Tabs */}
              <div className="top-bar-center">
                <nav className="flex items-center gap-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.to || pathname.startsWith(item.to + '/');
                    return (
                      <Link
                        key={item.to}
                        href={item.to}
                        className={cn(
                          'px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors',
                          isActive
                            ? 'bg-[#1A1918] text-white'
                            : 'text-[#6B6B66] hover:bg-[#F5F5F3] hover:text-[#3D3D3A]'
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Right Actions */}
              <div className="top-bar-actions">
                <button className="top-bar-action" title="Search">
                  <MagnifyingGlass className="h-4 w-4" weight="bold" />
                </button>
                <button className="top-bar-action" title="Notifications">
                  <Bell className="h-4 w-4" weight="bold" />
                </button>
                <button className="top-bar-action" title="Help">
                  <Question className="h-4 w-4" weight="bold" />
                </button>
                <div className="top-bar-avatar" title={user?.email}>
                  {initials}
                </div>
                <button onClick={() => signOut()} className="top-bar-action" title="Sign out">
                  <SignOut className="h-4 w-4" weight="bold" />
                </button>
              </div>
            </header>

            {/* Dashboard Workspace */}
            <main className="dashboard-workspace">
              {children}
            </main>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {mobileNavOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden flex flex-col shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-[#ECECEA]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF5F45] via-[#FF8A5B] to-[#F2B84B] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">B</span>
                  </div>
                  <span className="text-sm font-bold text-[#1A1918]">Brandcora</span>
                </div>
                <button onClick={() => setMobileNavOpen(false)} className="p-1">
                  <X className="h-5 w-5 text-[#8A8A85]" weight="bold" />
                </button>
              </div>
              <nav className="flex-1 p-3">
                {navItems.map((item) => {
                  const isActive = pathname === item.to || pathname.startsWith(item.to + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      href={item.to}
                      onClick={() => setMobileNavOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors',
                        isActive
                          ? 'bg-[#1A1918] text-white'
                          : 'text-[#6B6B66] hover:bg-[#F5F5F3] hover:text-[#3D3D3A]'
                      )}
                    >
                      <Icon className="h-5 w-5" weight="bold" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-[#ECECEA]">
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#6B6B66] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors w-full"
                >
                  <SignOut className="h-5 w-5" weight="bold" />
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
