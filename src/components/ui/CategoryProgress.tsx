import { cn } from '@/lib/utils';
import type { Category } from '@/types/remittance';
import { CategoryIcon } from './CategoryIcon';
import { CATEGORY_LABELS } from '@/types/remittance';

interface CategoryProgressProps {
  category: Category;
  allocated: number;
  spent: number;
  dailyLimit?: number;
  showDetails?: boolean;
  className?: string;
}

const progressColorMap: Record<Category, string> = {
  electricity: 'bg-category-electricity',
  water: 'bg-category-water',
  rent: 'bg-category-rent',
  school: 'bg-category-school',
  food: 'bg-category-food',
};

export function CategoryProgress({
  category,
  allocated,
  spent,
  dailyLimit,
  showDetails = true,
  className,
}: CategoryProgressProps) {
  const remaining = allocated - spent;
  const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CategoryIcon category={category} size={16} />
          <span className="text-small font-medium text-foreground">{CATEGORY_LABELS[category]}</span>
        </div>
        {showDetails && (
          <span className="text-small text-muted-foreground">
            ${remaining.toFixed(2)} left
          </span>
        )}
      </div>
      
      <div className="progress-bar">
        <div
          className={cn(
            'progress-bar-fill',
            progressColorMap[category]
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {showDetails && dailyLimit && (
        <p className="text-smaller text-muted-foreground">
          Daily limit: ${dailyLimit.toFixed(2)}
        </p>
      )}
    </div>
  );
}
