import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Warning, Empty, CheckCircle, Info } from '@phosphor-icons/react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    to?: string;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-gray-100 p-3 mb-4">
        {icon || <Empty className="h-6 w-6 text-gray-400" weight="bold" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      {action && (
        action.to ? (
          <Link to={action.to}>
            <Button icon={<ArrowRight className="h-4 w-4" weight="bold" />}>
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button onClick={action.onClick} icon={<ArrowRight className="h-4 w-4" weight="bold" />}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-red-50 p-3 mb-4">
        <Warning className="h-6 w-6 text-red-500" weight="bold" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

interface SuccessStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
}

export function SuccessState({ title, description, action }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-green-50 p-3 mb-4">
        <CheckCircle className="h-6 w-6 text-green-500" weight="bold" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>}
      {action && (
        action.to ? (
          <Link to={action.to}>
            <Button>{action.label}</Button>
          </Link>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  );
}

interface InfoStateProps {
  title: string;
  description: string;
}

export function InfoState({ title, description }: InfoStateProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" weight="bold" />
      <div>
        <h4 className="text-sm font-medium text-blue-900">{title}</h4>
        <p className="text-sm text-blue-700 mt-1">{description}</p>
      </div>
    </div>
  );
}
