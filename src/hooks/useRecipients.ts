import { useQuery } from '@tanstack/react-query';
import { getDailySpend } from '@/services/recipients';
import type { RecipientBalance, Category } from '@/types/remittance';

// ─── Daily spend query ───────────────────────────────────────────────────────

export function useDailySpend(recipientId: string | undefined) {
  return useQuery({
    queryKey: ['daily-spend', recipientId],
    queryFn: () => getDailySpend(recipientId!),
    enabled: !!recipientId,
  });
}

// ─── Recipient balances ──────────────────────────────────────────────────────
//
// The API's /recipients/{id}/daily-spend returns aggregate data, not
// per-category breakdowns. Until a per-category endpoint is available,
// this hook returns mock balances so the UI renders correctly.
//
// TODO: Replace with real API data when per-category endpoint ships.

const MOCK_BALANCES: RecipientBalance[] = [
  {
    category: 'electricity',
    availableKES: 8432,
    availableUSD: 55,
    dailyLimitKES: 2300,
    dailySpentKES: 500,
    isActive: true,
  },
  {
    category: 'water',
    availableKES: 4602,
    availableUSD: 30,
    dailyLimitKES: 1535,
    dailySpentKES: 0,
    isActive: true,
  },
  {
    category: 'rent',
    availableKES: 30700,
    availableUSD: 200,
    dailySpentKES: 0,
    isActive: true,
  },
  {
    category: 'food',
    availableKES: 5372,
    availableUSD: 35,
    dailyLimitKES: 1535,
    dailySpentKES: 768,
    isActive: true,
  },
];

export function useRecipientBalances(): {
  data: RecipientBalance[];
  isLoading: boolean;
} {
  // TODO: Replace with real API query when per-category endpoint is available
  return { data: MOCK_BALANCES, isLoading: false };
}
