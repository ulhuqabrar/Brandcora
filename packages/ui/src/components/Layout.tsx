import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { List, X } from '@phosphor-icons/react';

interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r border-gray-200 bg-gray-50">
      {children}
    </aside>
  );
}

interface SidebarHeaderProps {
  logo?: ReactNode;
  title: string;
}

export function SidebarHeader({ logo, title }: SidebarHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
      {logo}
      <span className="font-semibold text-gray-900">{title}</span>
    </div>
  );
}

interface SidebarNavProps {
  children: ReactNode;
}

export function SidebarNav({ children }: SidebarNavProps) {
  return <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">{children}</nav>;
}

interface SidebarItemProps {
  to: string;
  icon: ReactNode;
  children: ReactNode;
  active?: boolean;
}

export function SidebarItem({ to, icon, children, active }: SidebarItemProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

interface TopNavProps {
  children?: ReactNode;
  onMenuClick?: () => void;
}

export function TopNav({ children, onMenuClick }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 sm:px-6">
      <button
        type="button"
        className="lg:hidden p-2 text-gray-500 hover:text-gray-900"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <List className="h-5 w-5" weight="bold" />
      </button>
      <div className="flex-1" />
      {children}
    </header>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
