export type UserRole = 'sender' | 'recipient';

export type Category = 'electricity' | 'water' | 'rent' | 'school' | 'food';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface CategoryAllocation {
  category: Category;
  allocated: number; // USD for sender
  spent: number; // USD
  dailyLimit?: number; // USD per day
  isOneTime?: boolean;
}

export interface Remittance {
  id: string;
  recipientPhone: string;
  recipientName?: string;
  totalAmount: number; // USD
  remainingBalance: number; // USD
  allocations: CategoryAllocation[];
  status: 'pending_deposit' | 'active' | 'expired' | 'completed';
  createdAt: Date;
  expiresAt: Date;
}

export interface PaymentRequest {
  id: string;
  remittanceId: string;
  category: Category;
  amountKES: number;
  amountUSD: number;
  accountNumber: string; // meter number, school ref, etc.
  status: PaymentStatus;
  createdAt: Date;
  mpesaConfirmation?: string;
}

export interface RecipientBalance {
  category: Category;
  escrowId: string;
  categoryId: string;
  availableKES: number;
  availableUSD: number;
  dailyLimitKES?: number;
  dailySpentKES: number;
  isActive: boolean;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  electricity: 'Electricity',
  water: 'Water',
  rent: 'Rent',
  school: 'School Fees',
  food: 'Food',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  electricity: 'Zap',
  water: 'Droplets',
  rent: 'Home',
  school: 'GraduationCap',
  food: 'ShoppingCart',
};

// Mock exchange rate
export const USD_TO_KES = 153.5;
