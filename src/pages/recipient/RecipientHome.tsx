import { Link } from 'react-router-dom';
import { Plus, Wallet } from 'lucide-react';
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
        <div className="bg-primary text-primary-foreground rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-medium text-primary-foreground/80">
              Available Balance
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">KES {totalKES.toLocaleString()}</span>
          </div>
          <p className="text-sm text-primary-foreground/70 mt-1">
            ≈ ${totalUSD.toFixed(2)} USD
          </p>
        </div>

        {/* Request Payment Button */}
        <Link to="/recipient/request" className="block mb-6">
          <Button className="w-full h-12 text-base gap-2">
            <Plus className="w-5 h-5" />
            Request Bill Payment
          </Button>
        </Link>

        {/* Category Balances */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">
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

        {/* Info Note */}
        <div className="bg-accent/50 rounded-xl p-4 mt-6">
          <p className="text-sm text-accent-foreground">
            <strong>How it works:</strong> Request a bill payment and we'll pay it directly to the provider. You never handle the money—it goes straight to your bills.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
