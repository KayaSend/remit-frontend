import { useMutation } from '@tanstack/react-query';
import {
  initiateOnramp,
  createFundingIntent,
  getFundingIntentStatus,
  type CreateFundingIntentInput,
} from '@/services/onramp';

// ─── Legacy: trigger STK push for an existing escrow ─────────────────────────

interface OnrampInput {
  phone: string;
  escrowId: string;
}

/** Mutation hook to trigger an M-Pesa STK push for escrow funding. */
export function useInitiateOnramp() {
  return useMutation({
    mutationFn: ({ phone, escrowId }: OnrampInput) =>
      initiateOnramp(phone, escrowId),
  });
}

// ─── New flow: Funding Intent ────────────────────────────────────────────────

/** Mutation hook to create a funding intent and trigger M-Pesa STK push. */
export function useCreateFundingIntent() {
  return useMutation({
    mutationFn: (input: CreateFundingIntentInput) => createFundingIntent(input),
  });
}

/** Fetch intent status (for one-off calls; polling is done imperatively). */
export { getFundingIntentStatus };
