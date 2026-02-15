import { Zap, Droplets, Home, GraduationCap, ShoppingCart, Heart, Package } from 'lucide-react';
import type { Category } from '@/types/remittance';
import { cn } from '@/lib/utils';

interface CategoryIconProps {
  category: Category;
  size?: number;
  className?: string;
}

const iconMap: Record<Category, typeof Zap> = {
  electricity: Zap,
  water: Droplets,
  rent: Home,
  food: ShoppingCart,
  medical: Heart,
  education: GraduationCap,
  other: Package,
};

const colorMap: Record<Category, string> = {
  electricity: 'text-category-electricity',
  water: 'text-category-water',
  rent: 'text-category-rent',
  food: 'text-category-food',
  medical: 'text-category-medical',
  education: 'text-category-education',
  other: 'text-category-other',
};

const bgColorMap: Record<Category, string> = {
  electricity: 'bg-category-electricity/10',
  water: 'bg-category-water/10',
  rent: 'bg-category-rent/10',
  food: 'bg-category-food/10',
  medical: 'bg-category-medical/10',
  education: 'bg-category-education/10',
  other: 'bg-category-other/10',
};

export function CategoryIcon({ category, size = 20, className }: CategoryIconProps) {
  const Icon = iconMap[category];
  return <Icon size={size} className={cn(colorMap[category], className)} />;
}

export function CategoryBadge({ category, className }: { category: Category; className?: string }) {
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium',
      bgColorMap[category],
      colorMap[category],
      className
    )}>
      <CategoryIcon category={category} size={14} />
      <span className="capitalize">{category}</span>
    </div>
  );
}
