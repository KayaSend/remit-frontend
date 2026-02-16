import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Home, Receipt, XCircle, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORY_LABELS, type Category } from '@/types/remittance';
import { usePaymentRequest } from '@/hooks/usePaymentRequests';
import { useAutoOfframp } from '@/hooks/useAutoOfframp';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { PaymentRequestStatus } from '@/types/api';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { initiateOfframp } from '@/services/offramp';

type Status = 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'rejected';

const TERMINAL_STATUSES: Status[] = ['completed', 'failed', 'rejected'];

const statusConfig: Record<Status, {
  icon: typeof Clock;
  title: string;
  description: string;
  color: string;
  bg: string;
}> = {
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
    description: 'Processing M-Pesa transfer to your phone...',
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
  failed: {
    icon: XCircle,
    title: 'Payment Failed',
    description: 'Something went wrong processing your payment',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  rejected: {
    icon: XCircle,
    title: 'Request Rejected',
    description: 'Your sender declined this request',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
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
    case 'failed':
      return 'failed';
    case 'rejected':
      return 'rejected';
    case 'pending_approval':
    default:
      return 'pending';
  }
}

export default function PaymentStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [showRetryButton, setShowRetryButton] = useState(false);
  
  const { paymentRequestId, category, amountKES, accountNumber, recipientPhone } = (location.state || {}) as {
    paymentRequestId?: string;
    category?: Category;
    amountKES?: number;
    accountNumber?: string;
    recipientPhone?: string;
  };

  // Poll payment status every 3 seconds until a terminal status is reached
  const { data: paymentData, isLoading } = usePaymentRequest(paymentRequestId, {
    pollInterval: 3000,
    stopOnStatuses: ['completed', 'failed', 'rejected'],
  });

  const apiStatus = paymentData?.data?.status;
  const status = toUiStatus(apiStatus);
  const transactionHash = paymentData?.data?.transaction_hash;

  // Manual retry mutation
  const manualRetryMutation = useMutation({
    mutationFn: () => {
      if (!paymentData?.data || !recipientPhone || !amountKES) {
        throw new Error('Missing required data for retry');
      }
      return initiateOfframp(
        paymentData.data.payment_request_id,
        recipientPhone,
        amountKES,
        paymentData.data.transaction_hash || ''
      );
    },
    onSuccess: (data) => {
      toast.success(`M-Pesa payment initiated! Code: ${data.transactionCode}`);
      queryClient.invalidateQueries({ queryKey: ['payment-request'] });
      setShowRetryButton(false);
    },
    onError: (error: Error) => {
      toast.error(`Retry failed: ${error.message}. Please contact support.`);
    },
  });

  // Auto-trigger M-Pesa disbursement when onchain status is ready
  const { isTriggering, transactionCode } = useAutoOfframp({
    paymentData: paymentData?.data,
    recipientPhone,
    amountKes: amountKES,
    onSuccess: (transactionCode) => {
      toast.success(`M-Pesa payment initiated! Code: ${transactionCode}`);
      setShowPhoneError(false);
      setShowRetryButton(false);
    },
    onError: (error) => {
      if (error.message === 'RECIPIENT_PHONE_MISSING') {
        setShowPhoneError(true);
        // Don't show retry button if phone is missing - they need to navigate back
      } else {
        toast.error(`Auto-disbursement failed: ${error.message}`);
        setShowRetryButton(true);
      }
    },
  });

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

            {/* M-Pesa Confirmation Code - show from hook state or backend data */}
            {(transactionCode || paymentData?.data?.offramp_transaction_code) && (
              <div className="flex flex-col gap-2 py-3 bg-primary/10 -mx-4 px-4 rounded-lg mt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-primary font-semibold">M-Pesa Payment Sent</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Confirmation Code</span>
                  <span className="font-mono font-bold text-primary text-lg">
                    {transactionCode || paymentData?.data?.offramp_transaction_code}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  You should receive an M-Pesa confirmation SMS with this code shortly.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Auto-disbursement notification */}
        {isTriggering && (
          <Card className="card-elevated mb-6 border-primary animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Initiating M-Pesa Transfer</p>
                  <p className="text-sm text-muted-foreground">Sending payment to your phone automatically...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Missing phone error notification */}
        {showPhoneError && !recipientPhone && (
          <Card className="card-elevated mb-6 border-destructive animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-destructive mb-1">Payment Information Missing</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    We need your phone number to complete the M-Pesa transfer. This usually happens after a page refresh.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/recipient/request')}
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    Return to Request Payment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual retry option for failed auto-disbursement */}
        {showRetryButton && recipientPhone && paymentData?.data?.onchain_status === 'onchain_done_offramp_pending' && (
          <Card className="card-elevated mb-6 border-warning animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-foreground mb-1">Automatic Transfer Failed</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    The automatic M-Pesa transfer encountered an issue. You can try again manually.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => manualRetryMutation.mutate()}
                    disabled={manualRetryMutation.isPending}
                    className="gap-2"
                  >
                    {manualRetryMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Retry M-Pesa Transfer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Steps */}
        <div className="space-y-4 mb-8">
          {(['pending', 'approved', 'processing', 'completed'] as Status[]).map((s, i) => {
            const progressOrder = ['pending', 'approved', 'processing', 'completed'];
            const currentIdx = progressOrder.indexOf(status);
            const isTerminalError = status === 'failed' || status === 'rejected';
            // For failed/rejected, figure out which step the error maps to
            const errorStepIdx = status === 'rejected' ? 0 : status === 'failed' ? 2 : -1;
            const isPast = isTerminalError
              ? i < errorStepIdx
              : currentIdx >= i;
            const isActive = isTerminalError
              ? i === errorStepIdx
              : status === s;
            const isErrorStep = isTerminalError && isActive;

            return (
              <div key={s} className="flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  isErrorStep ? 'bg-destructive text-destructive-foreground' :
                  isPast ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {isErrorStep ? <XCircle className="w-4 h-4" /> :
                   isPast ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    'font-medium transition-colors',
                    isErrorStep ? 'text-destructive' :
                    isActive ? 'text-foreground' : isPast ? 'text-muted-foreground' : 'text-muted-foreground/50'
                  )}>
                    {isErrorStep ? statusConfig[status].title : statusConfig[s].title}
                  </p>
                </div>
                {isActive && !TERMINAL_STATUSES.includes(status) && (
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

        {(status === 'failed' || status === 'rejected') && (
          <div className="space-y-3 animate-fade-in">
            <Button
              className="w-full h-12"
              onClick={() => navigate('/recipient/request', {
                state: { category, amountKES, accountNumber },
              })}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
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

        {/* Navigation for non-terminal states (pending/approved/processing) */}
        {!TERMINAL_STATUSES.includes(status) && (
          <div className="space-y-3 animate-fade-in">
            {status === 'pending' && (
              <Card className="card-elevated mb-4">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Your sender has been notified. You can leave this page — we'll update the status automatically when they respond.
                  </p>
                </CardContent>
              </Card>
            )}
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
