import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Home, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORY_LABELS, type Category } from '@/types/remittance';
import { usePaymentRequest } from '@/hooks/usePaymentRequests';
import { cn } from '@/lib/utils';
import type { PaymentRequestStatus } from '@/types/api';

type Status = 'pending' | 'approved' | 'processing' | 'completed';

const statusConfig = {
  pending: {
    icon: Clock,
    title: 'Awaiting Approval',
    description: 'Your sender will review this request',
    color: 'text-pending',
    bg: 'bg-pending/10',
  },
  approved: {
    icon: Clock,
    title: 'Approved',
    description: 'Payment approved, preparing M-Pesa transfer',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  processing: {
    icon: Clock,
    title: 'Sending Payment',
    description: 'M-Pesa payment in progress...',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  completed: {
    icon: CheckCircle,
    title: 'Payment Complete!',
    description: 'Your bill has been paid successfully',
    color: 'text-success',
    bg: 'bg-success/10',
  },
};

/** Map API status to UI status */
function toUiStatus(apiStatus?: PaymentRequestStatus | string): Status {
  switch (apiStatus) {
    case 'completed':
      return 'completed';
    case 'processing':
      return 'processing';
    case 'approved':
      return 'approved';
    case 'pending_approval':
    default:
      return 'pending';
  }
}

export default function PaymentStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { paymentRequestId, category, amountKES, accountNumber } = (location.state || {}) as {
    paymentRequestId?: string;
    category?: Category;
    amountKES?: number;
    accountNumber?: string;
  };

  // Poll payment status every 3 seconds until completed
  const { data: paymentData, isLoading } = usePaymentRequest(paymentRequestId, {
    pollInterval: 3000,
    stopOnStatus: 'completed',
  });

  const apiStatus = paymentData?.data?.status;
  const status = toUiStatus(apiStatus);
  const transactionHash = paymentData?.data?.transaction_hash;

  if (!category || !paymentRequestId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No payment details found</p>
          <Button onClick={() => navigate('/recipient')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Show loading state initially
  if (isLoading && !status) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Status Animation */}
        <div className="text-center mb-8 animate-fade-in">
          <div className={cn(
            'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-500',
            config.bg
          )}>
            <StatusIcon className={cn('w-10 h-10 transition-colors duration-500', config.color)} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{config.title}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>

        {/* Payment Details */}
        <Card className="card-elevated mb-6">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium flex items-center gap-2">
                <CategoryIcon category={category} size={16} />
                {CATEGORY_LABELS[category]}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">KES {amountKES?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Account</span>
              <span className="font-medium">{accountNumber}</span>
            </div>
            
            {(status === 'completed' && transactionHash) && (
              <div className="flex items-center justify-between py-2 bg-success/10 -mx-4 px-4 rounded-lg mt-4">
                <span className="text-success font-medium flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Transaction Hash
                </span>
                <span className="font-mono text-success text-xs break-all">{transactionHash.slice(0, 12)}...{transactionHash.slice(-8)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <div className="space-y-4 mb-8">
          {(['pending', 'approved', 'processing', 'completed'] as Status[]).map((s, i) => {
            const isActive = status === s;
            const statusOrder = ['pending', 'approved', 'processing', 'completed'];
            const isPast = statusOrder.indexOf(status) >= i;
            
            return (
              <div key={s} className="flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  isPast ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {isPast ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    'font-medium transition-colors',
                    isActive ? 'text-foreground' : isPast ? 'text-muted-foreground' : 'text-muted-foreground/50'
                  )}>
                    {statusConfig[s].title}
                  </p>
                </div>
                {isActive && status !== 'completed' && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        {status === 'completed' && (
          <div className="space-y-3 animate-fade-in">
            <Button 
              className="w-full h-12"
              onClick={() => navigate('/recipient/request')}
            >
              Make Another Request
            </Button>
            <Button 
              variant="outline"
              className="w-full h-12"
              onClick={() => navigate('/recipient')}
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
