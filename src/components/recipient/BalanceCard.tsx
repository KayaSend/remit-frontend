import { Card, CardContent } from '@/components/ui/card';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORY_LABELS } from '@/types/remittance';
import type { RecipientBalance } from '@/types/remittance';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  balance: RecipientBalance;
  onClick?: () => void;
}

const categoryColorMap: Record<string, string> = {
  electricity: 'bg-category-electricity',
  water: 'bg-category-water',
  rent: 'bg-category-rent',
  school: 'bg-category-school',
  food: 'bg-category-food',
};

export function BalanceCard({ balance, onClick }: BalanceCardProps) {
  // One-time payment categories (rent, school) don't have daily limits
  const isOneTimePayment = balance.category === 'rent' || balance.category === 'school';
  
  const dailyRemaining = balance.dailyLimitKES && !isOneTimePayment
    ? balance.dailyLimitKES - balance.dailySpentKES 
    : null;
  
  const dailyPercentUsed = balance.dailyLimitKES && !isOneTimePayment
    ? (balance.dailySpentKES / balance.dailyLimitKES) * 100 
    : 0;

  return (
    <Card 
      className={cn(
        'card-elevated transition-all duration-300 cursor-pointer animate-fade-in overflow-hidden',
        !balance.isActive && 'opacity-60'
      )}
      onClick={onClick}
    >
      {/* Category color accent bar */}
      <div className={cn('h-1', categoryColorMap[balance.category])} />
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <CategoryIcon category={balance.category} size={20} />
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                {CATEGORY_LABELS[balance.category]}
              </h3>
              {!balance.isActive && (
                <span className="text-smaller px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Balance amounts */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-foreground">
              KES {balance.availableKES.toLocaleString()}
            </span>
          </div>
          <p className="text-smaller text-muted-foreground">
            ≈ ${balance.availableUSD.toFixed(2)} USD available
          </p>
        </div>

        {/* Daily limit section - only for non-one-time categories */}
        {dailyRemaining !== null && (
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-smaller text-muted-foreground">Today's limit</span>
              <span className={cn(
                'text-small font-medium',
                dailyRemaining <= 0 ? 'text-destructive' : 'text-foreground'
              )}>
                KES {dailyRemaining.toLocaleString()} left
              </span>
            </div>
            {/* Progress bar for daily limit */}
            <div className="progress-bar h-1.5">
              <div 
                className={cn(
                  'progress-bar-fill',
                  dailyPercentUsed > 90 ? 'bg-destructive' : 
                  dailyPercentUsed > 70 ? 'bg-warning' : 'bg-primary'
                )}
                style={{ width: `${Math.min(dailyPercentUsed, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* One-time payment indicator for rent/school */}
        {isOneTimePayment && balance.isActive && (
          <div className="bg-primary/10 rounded-lg p-3">
            <span className="text-smaller text-primary font-medium">
              One-time payment · No daily limit
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
