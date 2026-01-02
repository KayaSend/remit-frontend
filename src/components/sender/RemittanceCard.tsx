import { Link } from 'react-router-dom';
import { ChevronRight, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryProgress } from '@/components/ui/CategoryProgress';
import type { Remittance } from '@/types/remittance';

interface RemittanceCardProps {
  remittance: Remittance;
}

export function RemittanceCard({ remittance }: RemittanceCardProps) {
  const topAllocations = remittance.allocations.slice(0, 3);

  return (
    <Link to={`/sender/remittance/${remittance.id}`}>
      <Card className="card-elevated hover:shadow-md transition-shadow animate-fade-in">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <User className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {remittance.recipientName || 'Recipient'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {remittance.recipientPhone}
                </p>
              </div>
            </div>
            <StatusBadge status={remittance.status} />
          </div>

          {/* Balance Summary */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-foreground">
              ${remittance.remainingBalance.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              / ${remittance.totalAmount.toFixed(2)} remaining
            </span>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3 mb-4">
            {topAllocations.map((allocation) => (
              <CategoryProgress
                key={allocation.category}
                category={allocation.category}
                allocated={allocation.allocated}
                spent={allocation.spent}
                showDetails={false}
              />
            ))}
          </div>

          {/* View Details */}
          <div className="flex items-center justify-end text-sm text-primary font-medium">
            <span>View Details</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
