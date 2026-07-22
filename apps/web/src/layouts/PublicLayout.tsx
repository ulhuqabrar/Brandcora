import { Outlet, Link } from 'react-router-dom';
import { List } from '@phosphor-icons/react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export function PublicLayout() {
  const { session } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="text-xl font-extrabold tracking-tight">
            <span className="gradient-text">Brand Guard</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            {session ? (
              <Link to="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </nav>
          <button className="md:hidden p-2 text-muted-foreground" aria-label="Menu">
            <List className="h-5 w-5" weight="bold" />
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
