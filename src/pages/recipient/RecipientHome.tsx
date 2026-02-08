import { Link } from 'react-router-dom';
import { Plus, Wallet, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { BalanceCard } from '@/components/recipient/BalanceCard';
import { useRecipientBalances, useRecipientDashboard } from '@/hooks/useRecipients';

export default function RecipientHome() {
  const { data: balances, isLoading, isError, error } = useRecipientBalances();
  const { data: dashboard } = useRecipientDashboard();

  const totalKES = balances.reduce((sum, b) => sum + b.availableKES, 0);
  const totalUSD = balances.reduce((sum, b) => sum + b.availableUSD, 0);

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container px-4 py-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your balances...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <AppLayout>
        <div className="container px-4 py-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-h3 text-foreground">Unable to load balances</h2>
            <p className="text-muted-foreground max-w-sm">
              {error?.message || 'Something went wrong. Please try again.'}
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Empty state - no categories allocated
  if (balances.length === 0) {
    return (
      <AppLayout>
        <div className="container px-4 py-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-h3 text-foreground">No funds available yet</h2>
            <p className="text-muted-foreground max-w-sm">
              Your sender hasn't allocated any funds to your account yet. Check back soon!
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container px-4 py-6">
        {/* Welcome message if we have recipient name */}
        {dashboard?.recipient?.name && (
          <p className="text-small text-muted-foreground mb-2">
            Welcome back, {dashboard.recipient.name.split(' ')[0]}
          </p>
        )}

        {/* Balance Summary */}
        <div className="summary-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5" />
            <span className="text-small font-medium text-primary-foreground/80">
              Available Balance
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="amount-display">KES {totalKES.toLocaleString()}</span>
          </div>
          <p className="text-small text-primary-foreground/70">
            ≈ ${totalUSD.toFixed(2)} USD across {balances.length} categor{balances.length === 1 ? 'y' : 'ies'}
          </p>

          {/* Daily spend info if available */}
          {dashboard?.dailySpend && dashboard.dailySpend.limitUsd > 0 && (
            <div className="mt-3 pt-3 border-t border-primary-foreground/20">
              <p className="text-small text-primary-foreground/70">
                Daily: ${dashboard.dailySpend.spentTodayUsd.toFixed(2)} / ${dashboard.dailySpend.limitUsd.toFixed(2)} spent
              </p>
            </div>
          )}
        </div>

        {/* Request Payment Button - Primary CTA */}
        <Link to="/recipient/request" className="block mb-6">
          <Button className="w-full h-14 text-base gap-3 bg-primary/60 hover:bg-primary/80">
            <Plus className="w-5 h-5" />
            Request Bill Payment
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>
        </Link>

        {/* Category Balances */}
        <div className="mb-4">
          <h2 className="text-h3 text-foreground mb-4">
            Your Categories
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {balances.map((balance) => (
              <BalanceCard
                key={balance.category}
                balance={balance}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>

        {/* Active escrows count */}
        {dashboard?.activeEscrows && dashboard.activeEscrows.length > 0 && (
          <div className="text-center mt-4">
            <p className="text-small text-muted-foreground">
              {dashboard.activeEscrows.length} active escrow{dashboard.activeEscrows.length === 1 ? '' : 's'} from your sender
            </p>
          </div>
        )}

        {/* Info Note - Plain language */}
        <div className="info-box mt-6">
          <p className="text-small text-foreground">
            <strong>How it works:</strong> Request a bill payment and we'll pay it directly via M-Pesa. You never handle the money—it goes straight to your bills.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
