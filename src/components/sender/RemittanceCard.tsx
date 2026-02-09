import { Link } from 'react-router-dom';
import { ChevronRight, User, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORY_LABELS, type Remittance } from '@/types/remittance';
import { cn } from '@/lib/utils';

interface RemittanceCardProps {
  remittance: Remittance;
}

const categoryColorMap: Record<string, string> = {
  electricity: 'bg-category-electricity',
  water: 'bg-category-water',
  rent: 'bg-category-rent',
  school: 'bg-category-school',
  food: 'bg-category-food',
};

export function RemittanceCard({ remittance }: RemittanceCardProps) {
  const spentAmount = remittance.totalAmount - remittance.remainingBalance;
  const spentPercentage = (spentAmount / remittance.totalAmount) * 100;
  const topAllocations = remittance.allocations.slice(0, 3);

  return (
    <Link to={`/sender/remittance/${remittance.id}`}>
      <Card className="card-elevated hover:shadow-elevated-hover transition-shadow duration-300 animate-fade-in overflow-hidden">
        <CardContent className="p-5">
          {/* Header: Recipient + Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center">
                <User className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {remittance.recipientName || 'Recipient'}
                </p>
                <p className="text-smaller text-muted-foreground">
                  {remittance.recipientPhone}
                </p>
              </div>
            </div>
            <StatusBadge status={remittance.status} />
          </div>

          {/* Balance Summary - Clear sent vs remaining */}
          <div className="bg-secondary/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-smaller text-muted-foreground mb-0.5">Remaining</p>
                <p className="text-xl font-semibold text-foreground">
                  ${remittance.remainingBalance.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-smaller text-muted-foreground mb-0.5">Sent</p>
                <p className="text-h3 text-muted-foreground">
                  ${remittance.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
            
            {/* Progress bar showing spent */}
            <div className="progress-bar">
              <div 
                className="progress-bar-fill bg-primary"
                style={{ width: `${spentPercentage}%` }}
              />
            </div>
            <p className="text-smaller text-muted-foreground mt-2">
              ${spentAmount.toFixed(2)} spent ({spentPercentage.toFixed(0)}%)
            </p>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {topAllocations.map((allocation) => {
              const remainingInCategory = allocation.allocated - allocation.spent;
              return (
                <div 
                  key={allocation.category}
                  className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2"
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    categoryColorMap[allocation.category]
                  )} />
                  <span className="text-smaller font-medium text-foreground">
                    {CATEGORY_LABELS[allocation.category]}
                  </span>
                  <span className="text-smaller text-muted-foreground">
                    ${remainingInCategory.toFixed(0)}
                  </span>
                </div>
              );
            })}
            {remittance.allocations.length > 3 && (
              <div className="flex items-center px-3 py-2">
                <span className="text-smaller text-muted-foreground">
                  +{remittance.allocations.length - 3} more
                </span>
              </div>
            )}
          </div>

          {/* CTA */}
          {remittance.status === 'pending_deposit' ? (
            <div className="flex items-center justify-between">
              <span className="text-small text-warning font-medium">Not yet funded</span>
              <div className="flex items-center gap-1 text-small text-primary font-medium">
                <Smartphone className="w-4 h-4" />
                <span>Fund Now</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end text-small text-primary font-medium">
              <span>View Details</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
