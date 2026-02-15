import { useEffect, useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { initiateOfframp } from '@/services/offramp';
import type { PaymentRequestDetailData } from '@/types/api';

interface AutoOfframpOptions {
  /** The payment request data from polling */
  paymentData?: PaymentRequestDetailData;
  /** Recipient phone number for M-Pesa disbursement */
  recipientPhone?: string;
  /** Amount in KES */
  amountKes?: number;
  /** Callback when auto-trigger succeeds */
  onSuccess?: (transactionCode: string) => void;
  /** Callback when auto-trigger fails */
  onError?: (error: Error) => void;
}

const TRIGGERED_PAYMENTS_KEY = 'kindred_triggered_offramps';
const MAX_TRIGGERED_ENTRIES = 100;

/**
 * Utilities for managing triggered payments in localStorage
 */
const TriggeredPaymentsStore = {
  get(): Set<string> {
    try {
      const stored = localStorage.getItem(TRIGGERED_PAYMENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return new Set(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.warn('[Auto-offramp] Failed to read triggered payments from localStorage:', error);
    }
    return new Set();
  },

  add(paymentId: string): void {
    try {
      const triggered = this.get();
      triggered.add(paymentId);

      // Keep only the most recent entries
      const entries = Array.from(triggered);
      const trimmed = entries.slice(-MAX_TRIGGERED_ENTRIES);
      
      localStorage.setItem(TRIGGERED_PAYMENTS_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.warn('[Auto-offramp] Failed to save triggered payment to localStorage:', error);
    }
  },

  has(paymentId: string): boolean {
    return this.get().has(paymentId);
  },
};

/**
 * Hook that automatically triggers M-Pesa offramp disbursement
 * when payment status reaches `onchain_done_offramp_pending`.
 * 
 * Uses localStorage to persist triggered payments across page refreshes,
 * preventing duplicate disbursement attempts.
 */
export function useAutoOfframp({
  paymentData,
  recipientPhone,
  amountKes,
  onSuccess,
  onError,
}: AutoOfframpOptions) {
  const queryClient = useQueryClient();
  const [missingPhoneWarned, setMissingPhoneWarned] = useState(false);
  const [transactionCode, setTransactionCode] = useState<string | null>(null);

  // Stabilize callbacks to prevent effect re-runs
  const stableOnSuccess = useCallback((transactionCode: string) => {
    onSuccess?.(transactionCode);
  }, [onSuccess]);

  const stableOnError = useCallback((error: Error) => {
    onError?.(error);
  }, [onError]);

  const offrampMutation = useMutation({
    mutationFn: ({
      paymentRequestId,
      phone,
      amount,
      txHash,
    }: {
      paymentRequestId: string;
      phone: string;
      amount: number;
      txHash: string;
    }) => initiateOfframp(paymentRequestId, phone, amount, txHash),
    onSuccess: (data) => {
      setTransactionCode(data.transactionCode);
      queryClient.invalidateQueries({ queryKey: ['payment-request'] });
      queryClient.invalidateQueries({ queryKey: ['escrow'] });
      stableOnSuccess(data.transactionCode);
    },
    onError: (error: Error) => {
      console.error('Auto-offramp failed:', error);
      stableOnError(error);
    },
  });

  useEffect(() => {
    if (!paymentData) {
      return;
    }

    const {
      payment_request_id,
      onchain_status,
      transaction_hash,
      offramp_status,
    } = paymentData;

    // Check if we should trigger offramp
    const shouldTrigger =
      onchain_status === 'onchain_done_offramp_pending' &&
      offramp_status !== 'completed' &&
      offramp_status !== 'processing' &&
      transaction_hash != null;

    // Handle missing phone number with user-facing callback
    if (shouldTrigger && !recipientPhone && !missingPhoneWarned) {
      console.warn('[Auto-offramp] Cannot trigger: recipient phone missing. Did user refresh page?');
      setMissingPhoneWarned(true);
      stableOnError(new Error('RECIPIENT_PHONE_MISSING'));
      return;
    }

    // Check if already triggered (localStorage persistence)
    const alreadyTriggered = TriggeredPaymentsStore.has(payment_request_id);

    if (shouldTrigger && !alreadyTriggered && !offrampMutation.isPending && recipientPhone && amountKes) {
      console.log(
        `[Auto-offramp] Triggering disbursement for payment request ${payment_request_id}`
      );
      
      // Mark as triggered BEFORE making the API call
      TriggeredPaymentsStore.add(payment_request_id);

      offrampMutation.mutate({
        paymentRequestId: payment_request_id,
        phone: recipientPhone,
        amount: amountKes,
        txHash: transaction_hash,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    paymentData,
    recipientPhone,
    amountKes,
    offrampMutation.isPending,
    offrampMutation.mutate,
  ]);

  return {
    isTriggering: offrampMutation.isPending,
    error: offrampMutation.error,
    transactionCode,
  };
}
