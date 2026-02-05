import { useMutation } from '@tanstack/react-query';
import { initiateOnramp } from '@/services/onramp';

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
