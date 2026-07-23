'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { List, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
}

interface HeaderProps {
  navItems?: NavItem[];
  showAuth?: boolean;
}

export function Header({ navItems, showAuth = true }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const defaultNavItems: NavItem[] = [
    { label: 'Features', href: '#extraction' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  const items = navItems ?? defaultNavItems;

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5"
        role="banner"
      >
        <nav
          className={cn(
            'mx-auto flex items-center justify-between',
            'max-w-[960px] px-5 h-14 sm:h-16',
            'bg-surface rounded-2xl border border-border/50',
            'shadow-[0_2px_20px_rgba(57,39,29,0.06)]',
            'header-float'
          )}
          aria-label="Main navigation"
        >
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            aria-label="Brandcora home"
          >
            <img src="/logo.png" alt="" className="h-7 w-auto" aria-hidden="true" />
            <span className="text-base font-bold text-foreground tracking-tight hidden sm:block">
              Brandcora
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {items.map((item) => {
              const isActive = item.href.startsWith('#')
                ? false
                : pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm transition-colors duration-200',
                    isActive
                      ? 'text-foreground font-medium'
                      : 'text-foreground-secondary hover:text-foreground'
                  )}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* Desktop auth */}
          {showAuth && (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="gradient-accent text-white px-4 h-9 rounded-xl"
                >
                  Get started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 -mr-2 text-foreground-secondary hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <List className="h-5 w-5" weight="bold" />
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="absolute top-0 right-0 h-full w-[min(320px,85vw)] bg-surface shadow-elevated p-6 flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <img src="/logo.png" alt="" className="h-6 w-auto" aria-hidden="true" />
                <span className="text-sm font-bold text-foreground">Brandcora</span>
              </Link>
              <button
                type="button"
                className="p-2 -mr-2 text-foreground-muted hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" weight="bold" />
              </button>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              {items.map((item) => {
                const isActive = item.href.startsWith('#')
                  ? false
                  : pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground-secondary hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>

            {showAuth && (
              <div className="mt-auto pt-6 border-t border-border space-y-3">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block">
                  <Button variant="outline" className="w-full border-border">
                    Log in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block">
                  <Button className="w-full gradient-accent text-white">
                    Get started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
