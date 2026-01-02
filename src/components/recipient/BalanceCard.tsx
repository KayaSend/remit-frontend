import { Card, CardContent } from '@/components/ui/card';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORY_LABELS } from '@/types/remittance';
import type { RecipientBalance } from '@/types/remittance';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  balance: RecipientBalance;
  onClick?: () => void;
}

export function BalanceCard({ balance, onClick }: BalanceCardProps) {
  const dailyRemaining = balance.dailyLimitKES 
    ? balance.dailyLimitKES - balance.dailySpentKES 
    : null;

  return (
    <Card 
      className={cn(
        'card-elevated hover:shadow-md transition-all cursor-pointer animate-fade-in',
        !balance.isActive && 'opacity-60'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <CategoryIcon category={balance.category} size={20} />
          </div>
          {!balance.isActive && (
            <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
              Inactive
            </span>
          )}
        </div>

        <h3 className="font-medium text-foreground mb-1">
          {CATEGORY_LABELS[balance.category]}
        </h3>

        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-2xl font-bold text-foreground">
            KES {balance.availableKES.toLocaleString()}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          ≈ ${balance.availableUSD.toFixed(2)} USD
        </p>

        {dailyRemaining !== null && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Today's limit:</span>
              <span className={cn(
                'font-medium',
                dailyRemaining <= 0 ? 'text-destructive' : 'text-foreground'
              )}>
                KES {dailyRemaining.toLocaleString()} left
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
