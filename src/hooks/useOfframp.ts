import { useMutation } from '@tanstack/react-query';
import { initiateOfframp } from '@/services/offramp';

interface OfframpInput {
  paymentRequestId: string;
  phone: string;
  amountKes: number;
  transactionHash: string;
}

/** Mutation hook to disburse KES via M-Pesa to a recipient. */
export function useInitiateOfframp() {
  return useMutation({
    mutationFn: ({ paymentRequestId, phone, amountKes, transactionHash }: OfframpInput) =>
      initiateOfframp(paymentRequestId, phone, amountKes, transactionHash),
  });
}
