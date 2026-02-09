import { useQuery } from '@tanstack/react-query';
import { claimRecipient, getDailySpend, getRecipientDashboard } from '@/services/recipients';
import type { RecipientBalance, Category } from '@/types/remittance';
import type { RecipientDashboardData } from '@/types/api';

// ─── Daily spend query ───────────────────────────────────────────────────────

export function useDailySpend(recipientId: string | undefined) {
  return useQuery({
    queryKey: ['daily-spend', recipientId],
    queryFn: () => getDailySpend(recipientId!),
    enabled: !!recipientId,
  });
}

// ─── Recipient Dashboard ─────────────────────────────────────────────────────

export function useRecipientDashboard() {
  return useQuery({
    queryKey: ['recipient-dashboard'],
    queryFn: async () => {
      try {
        const response = await getRecipientDashboard();
        return response.data;
      } catch (err: any) {
        // Option B: If the recipient hasn't claimed yet, attempt to claim and retry once.
        if (err?.status === 404) {
          await claimRecipient();
          const response = await getRecipientDashboard();
          return response.data;
        }
        throw err;
      }
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

// ─── Recipient balances ──────────────────────────────────────────────────────
//
// Transforms dashboard data into RecipientBalance[] for the UI.
// Falls back to empty array if no dashboard data.

const EXCHANGE_RATE = 153.5; // TODO: fetch from API

function mapCategoryToBalance(
  cat: RecipientDashboardData['categories'][0]
): RecipientBalance {
  const categoryKey = cat.category.toLowerCase() as Category;
  return {
    category: categoryKey,
    availableUSD: cat.remainingUsd,
    availableKES: Math.round(cat.remainingUsd * EXCHANGE_RATE),
    dailySpentKES: Math.round(cat.spentUsd * EXCHANGE_RATE),
    isActive: cat.remainingUsd > 0,
  };
}

export function useRecipientBalances(): {
  data: RecipientBalance[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} {
  const { data: dashboard, isLoading, isError, error } = useRecipientDashboard();

  if (!dashboard) {
    return { data: [], isLoading, isError, error: error as Error | null };
  }

  const balances = dashboard.categories.map(mapCategoryToBalance);
  return { data: balances, isLoading: false, isError: false, error: null };
}
