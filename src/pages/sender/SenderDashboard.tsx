import { Link } from 'react-router-dom';
import { Plus, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { RemittanceCard } from '@/components/sender/RemittanceCard';
import { useMockRemittances } from '@/hooks/useMockData';

export default function SenderDashboard() {
  const remittances = useMockRemittances();
  
  const totalSent = remittances.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalRemaining = remittances.reduce((sum, r) => sum + r.remainingBalance, 0);
  const totalSpent = totalSent - totalRemaining;

  return (
    <AppLayout>
      <div className="container px-4 py-6">
        {/* Summary Card with clear money breakdown */}
        <div className="summary-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            <span className="text-small font-medium text-primary-foreground/80">
              Your Active Remittances
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-smaller text-primary-foreground/60 mb-1">Money Remaining</p>
              <p className="amount-display">${totalRemaining.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-smaller text-primary-foreground/60 mb-1">Total Sent</p>
              <p className="text-xl font-medium text-primary-foreground/80">${totalSent.toFixed(2)}</p>
            </div>
          </div>

          {/* Visual progress */}
          <div className="bg-primary-foreground/20 rounded-full h-2 mb-2 overflow-hidden">
            <div 
              className="h-full bg-primary-foreground/80 rounded-full transition-all"
              style={{ width: `${(totalSpent / totalSent) * 100}%` }}
            />
          </div>
          <p className="text-smaller text-primary-foreground/70">
            ${totalSpent.toFixed(2)} spent across {remittances.length} remittance{remittances.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h3 text-foreground">
            Your Remittances
          </h2>
          <Link to="/sender/create">
            <Button size="sm" className="gap-2 bg-primary/60 hover:bg-primary/80">
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
              <ArrowUpRight className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">No remittances yet</h3>
            <p className="text-small text-muted-foreground mb-6 max-w-xs mx-auto">
              Send money to family in Kenya. You control how it's spent on bills and essentials.
            </p>
            <Link to="/sender/create">
              <Button className="bg-primary/60 hover:bg-primary/80">
                <Plus className="w-4 h-4 mr-2" />
                Send Your First Remittance
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
