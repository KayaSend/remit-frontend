import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { createEscrow, getEscrow } from '@/services/escrow';
import { fromCents } from '@/services/api';
import {
  getStoredEscrows,
  addStoredEscrow,
  type StoredEscrow,
} from '@/lib/local-store';
import type { CreateEscrowRequest, EscrowDetailResponse } from '@/types/api';
import type { Remittance, CategoryAllocation, Category } from '@/types/remittance';

// ─── Single escrow query ─────────────────────────────────────────────────────

export function useEscrow(escrowId: string | undefined) {
  return useQuery({
    queryKey: ['escrow', escrowId],
    queryFn: () => getEscrow(escrowId!),
    enabled: !!escrowId,
  });
}

// ─── Escrow list (localStorage IDs → parallel fetches) ──────────────────────

/** Map a category name string from the API to the UI Category type. */
function toCategory(name: string): Category {
  const map: Record<string, Category> = {
    electricity: 'electricity',
    water: 'water',
    rent: 'rent',
    school: 'school',
    'school fees': 'school',
    food: 'food',
    groceries: 'food',
  };
  return map[name.toLowerCase()] ?? 'food';
}

/** Merge stored creation data with live API detail into a UI Remittance. */
function toRemittance(
  stored: StoredEscrow,
  detail: EscrowDetailResponse | undefined,
): Remittance {
  const allocations: CategoryAllocation[] = stored.categories.map((cat) => {
    const live = detail?.categories.find(
      (c) => c.name.toLowerCase() === cat.name.toLowerCase(),
    );
    const allocated = cat.amountUsd;
    const remaining = live ? live.remainingUsd : allocated;
    return {
      category: toCategory(cat.name),
      allocated,
      spent: allocated - remaining,
    };
  });

  const totalAmount = stored.totalAmountUsd;
  const remainingBalance = detail
    ? totalAmount - detail.spentUsd
    : totalAmount;

  return {
    id: stored.escrowId,
    recipientPhone: stored.recipientPhone,
    totalAmount,
    remainingBalance,
    allocations,
    status:
      detail?.status === 'completed'
        ? 'completed'
        : detail?.status === 'pending_deposit'
          ? 'pending_deposit'
          : 'active',
    createdAt: new Date(stored.createdAt),
    expiresAt: new Date(
      new Date(stored.createdAt).getTime() + 90 * 24 * 60 * 60 * 1000,
    ), // 90 days
  };
}

export function useEscrowList() {
  const stored = getStoredEscrows();

  const results = useQueries({
    queries: stored.map((s) => ({
      queryKey: ['escrow', s.escrowId],
      queryFn: () => getEscrow(s.escrowId),
      staleTime: 30_000,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);

  const remittances: Remittance[] = stored.map((s, i) =>
    toRemittance(s, results[i]?.data ?? undefined),
  );

  return { data: remittances, isLoading };
}

// ─── Create escrow mutation ──────────────────────────────────────────────────

export function useCreateEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEscrowRequest) => createEscrow(payload),
    // Intentionally does NOT persist to localStorage.
    // We only save escrows locally once they are funded/active,
    // so unfunded drafts don't appear in the dashboard.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrow'] });
    },
  });
}
