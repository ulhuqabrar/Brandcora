import { type ReactNode } from 'react';
import { Spinner } from '@phosphor-icons/react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return <Spinner className={`animate-spin text-blue-600 ${sizeClasses[size]} ${className}`} weight="bold" />;
}

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-sm text-gray-500">{message}</p>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

interface LoadingButtonProps {
  loading?: boolean;
  children: ReactNode;
}

export function LoadingButton({ loading, children }: LoadingButtonProps) {
  return (
    <span className="inline-flex items-center gap-2">
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </span>
  );
}
