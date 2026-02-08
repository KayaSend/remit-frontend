import { Smartphone, CheckCircle2, AlertTriangle, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type PaymentPhase = 'processing' | 'waiting' | 'success' | 'timeout' | 'error';

interface PaymentOverlayProps {
  phase: PaymentPhase;
  phoneNumber: string;
  amountKes: string;
  transactionCode?: string;
  errorMessage?: string;
  elapsedSeconds: number;
  onRetry: () => void;
  onViewEscrow: () => void;
  onDone: () => void;
}

const TIMEOUT_SECONDS = 90;

function formatPhoneKeLocal(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // 9 digits expected (712345678)
  if (digits.length === 9) return `+254 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  if (digits.length === 10 && digits.startsWith('0')) {
    const d = digits.slice(1);
    return `+254 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }
  return `+254 ${digits}`.trim();
}

export function PaymentOverlay({
  phase,
  phoneNumber,
  amountKes,
  transactionCode,
  errorMessage,
  elapsedSeconds,
  onRetry,
  onViewEscrow,
  onDone,
}: PaymentOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4">
        {/* Processing Phase */}
        {phase === 'processing' && (
          <div className="text-center animate-fade-in">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Setting up your escrow
            </h2>
            <p className="text-sm text-muted-foreground">
              This will only take a moment...
            </p>
          </div>
        )}

        {/* Waiting Phase */}
        {phase === 'waiting' && (
          <div className="text-center animate-fade-in">
            {/* Pulsing phone icon */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 rounded-full bg-primary/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Smartphone className="w-10 h-10 text-primary" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground mb-2">
              Check your phone
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Enter your M-Pesa PIN to complete the payment
            </p>

            {/* Payment details card */}
            <div className="bg-card border border-border rounded-2xl p-5 mb-6 text-left">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-lg font-semibold text-foreground">KES {amountKes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-sm font-medium text-foreground">{formatPhoneKeLocal(phoneNumber)}</span>
              </div>
            </div>

            {/* Countdown / progress */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
              <span className="text-xs text-muted-foreground">
                Waiting for confirmation ({TIMEOUT_SECONDS - elapsedSeconds}s)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(elapsedSeconds / TIMEOUT_SECONDS) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Success Phase */}
        {phase === 'success' && (
          <div className="text-center animate-fade-in">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-success/10" />
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                <CheckCircle2 className="w-12 h-12 text-success" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground mb-2">
              Payment Confirmed!
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your escrow has been funded successfully
            </p>

            {transactionCode && (
              <div className="bg-card border border-border rounded-2xl p-4 mb-6">
                <span className="text-xs text-muted-foreground block mb-1">Transaction Code</span>
                <span className="text-base font-mono font-semibold text-foreground">{transactionCode}</span>
              </div>
            )}

            <Button className="w-full h-12 text-base" onClick={onDone}>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              View Escrow Details
            </Button>
          </div>
        )}

        {/* Timeout Phase */}
        {phase === 'timeout' && (
          <div className="text-center animate-fade-in">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-warning/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-warning" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground mb-2">
              Payment not received
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              We didn't get a confirmation. The M-Pesa prompt may have expired or been cancelled.
            </p>

            <div className="space-y-3">
              <Button className="w-full h-12 text-base" onClick={onRetry}>
                <Smartphone className="w-5 h-5 mr-2" />
                Retry M-Pesa Payment
              </Button>
              <Button variant="outline" className="w-full h-12 text-base" onClick={onViewEscrow}>
                View Escrow
              </Button>
            </div>
          </div>
        )}

        {/* Error Phase */}
        {phase === 'error' && (
          <div className="text-center animate-fade-in">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-destructive/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {errorMessage || 'We could not process your payment. Please try again.'}
            </p>

            <div className="space-y-3">
              <Button className="w-full h-12 text-base" onClick={onRetry}>
                Try Again
              </Button>
              <Button variant="outline" className="w-full h-12 text-base" onClick={onViewEscrow}>
                View Escrow
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CSS for scaleIn animation */}
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
