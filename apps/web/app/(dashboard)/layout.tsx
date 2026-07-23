'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House,
  GearSix,
  Receipt,
  SignOut,
  User,
  List,
  ShieldCheck,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/protected-route';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/brand', icon: ShieldCheck, label: 'Brand Profile' },
  { to: '/scans', icon: MagnifyingGlass, label: 'Reports' },
  { to: '/settings', icon: GearSix, label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 glass-strong shadow-glass lg:relative lg:translate-x-0 transition-transform duration-200",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center px-6">
              <Link href="/dashboard" className="flex items-center">
                <img src="/logo.png" alt="Brand Guard" className="h-8 w-auto" />
              </Link>
            </div>
            <nav className="flex-1 p-4">
              <div className="space-y-0.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.to || pathname.startsWith(item.to + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      href={item.to}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none",
                        isActive
                          ? "text-accent gradient-bg-50 font-bold gradient-border"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="h-5 w-5" weight="bold" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
            <div className="border-t p-3">
              <button
                onClick={() => signOut()}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <SignOut className="h-5 w-5" weight="bold" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 glass border-b px-4 sm:px-6">
            <button
              type="button"
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <List className="h-5 w-5" weight="bold" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
              <div className="h-8 w-8 rounded-full gradient-accent flex items-center justify-center shadow-glass">
                <User className="h-4 w-4 text-white" weight="bold" />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
