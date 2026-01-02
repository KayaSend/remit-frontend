import { Link } from 'react-router-dom';
import { Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { RemittanceCard } from '@/components/sender/RemittanceCard';
import { useMockRemittances } from '@/hooks/useMockData';

export default function SenderDashboard() {
  const remittances = useMockRemittances();
  
  const totalSent = remittances.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalRemaining = remittances.reduce((sum, r) => sum + r.remainingBalance, 0);

  return (
    <AppLayout>
      <div className="container px-4 py-6">
        {/* Summary Card */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium text-primary-foreground/80">
              Total Active
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">${totalRemaining.toFixed(2)}</span>
            <span className="text-primary-foreground/70">
              / ${totalSent.toFixed(2)} sent
            </span>
          </div>
          <p className="text-sm text-primary-foreground/70 mt-2">
            Across {remittances.length} active remittances
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Your Remittances
          </h2>
          <Link to="/sender/create">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Send Money
            </Button>
          </Link>
        </div>

        {/* Remittance List */}
        {remittances.length > 0 ? (
          <div className="space-y-4">
            {remittances.map((remittance) => (
              <RemittanceCard key={remittance.id} remittance={remittance} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">No remittances yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Send money to your family with purpose-locked spending.
            </p>
            <Link to="/sender/create">
              <Button>Send Your First Remittance</Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
