import { cn } from '@/lib/utils';
import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';
import type { PaymentStatus } from '@/types/remittance';

interface StatusBadgeProps {
  status: PaymentStatus | 'active' | 'expired' | 'completed';
  className?: string;
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string; animate?: boolean }> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-pending/10 text-pending',
  },
  processing: {
    label: 'Processing',
    icon: Loader2,
    className: 'bg-warning/10 text-warning',
    animate: true,
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'bg-success/10 text-success',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive',
  },
  active: {
    label: 'Active',
    icon: CheckCircle,
    className: 'bg-success/10 text-success',
  },
  expired: {
    label: 'Expired',
    icon: XCircle,
    className: 'bg-muted text-muted-foreground',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium',
      config.className,
      className
    )}>
      <Icon 
        size={14} 
        className={cn(config.animate && 'animate-spin')} 
      />
      <span>{config.label}</span>
    </div>
  );
}
