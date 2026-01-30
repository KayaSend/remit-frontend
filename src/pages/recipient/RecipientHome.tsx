import { Link } from 'react-router-dom';
import { Plus, Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { BalanceCard } from '@/components/recipient/BalanceCard';
import { useMockRecipientBalances } from '@/hooks/useMockData';

export default function RecipientHome() {
  const balances = useMockRecipientBalances();
  
  const totalKES = balances.reduce((sum, b) => sum + b.availableKES, 0);
  const totalUSD = balances.reduce((sum, b) => sum + b.availableUSD, 0);

  return (
    <AppLayout>
      <div className="container px-4 py-6">
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
            ≈ ${totalUSD.toFixed(2)} USD across {balances.length} categories
          </p>
        </div>

        {/* Request Payment Button - Primary CTA */}
        <Link to="/recipient/request" className="block mb-6">
          <Button className="w-full h-14 text-base gap-3 shadow-primary">
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
