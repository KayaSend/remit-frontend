import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPaymentRequest,
  getPaymentRequest,
  getSenderPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
  executePaymentRequest,
} from '@/services/payments';
import { fromCents } from '@/services/api';
import {
  getStoredPaymentRequests,
  addStoredPaymentRequest,
  type StoredPaymentRequest,
} from '@/lib/local-store';
import type { CreatePaymentRequestBody, PaymentRequestStatus } from '@/types/api';
import type { PaymentRequest, PaymentStatus, Category } from '@/types/remittance';

// ─── Single payment request (supports polling) ──────────────────────────────

interface UsePaymentRequestOptions {
  /** Poll interval in ms. Pass 0 or false to disable. Default: 0. */
  pollInterval?: number | false;
  /** Stop polling when any of these statuses is reached. */
  stopOnStatuses?: PaymentRequestStatus[];
}

export function usePaymentRequest(
  paymentRequestId: string | undefined,
  options: UsePaymentRequestOptions = {},
) {
  const { pollInterval = 0, stopOnStatuses } = options;

  return useQuery({
    queryKey: ['payment-request', paymentRequestId],
    queryFn: () => getPaymentRequest(paymentRequestId!),
    enabled: !!paymentRequestId,
    refetchInterval: pollInterval
      ? (query) => {
          const status = query.state.data?.data?.status;
          if (stopOnStatuses?.includes(status as PaymentRequestStatus)) return false;
          return pollInterval;
        }
      : false,
  });
}

// ─── Payment request list (from localStorage) ───────────────────────────────

/** Map API status to the UI PaymentStatus. */
function toUiStatus(apiStatus?: PaymentRequestStatus): PaymentStatus {
  switch (apiStatus) {
    case 'completed':
      return 'completed';
    case 'processing':
      return 'processing';
    case 'pending_approval':
    default:
      return 'pending';
  }
}

/** Map a category ID/name to the UI Category type. */
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

/** Convert a stored payment request to the UI PaymentRequest type. */
function toPaymentRequest(stored: StoredPaymentRequest): PaymentRequest {
  return {
    id: stored.paymentRequestId,
    remittanceId: stored.escrowId,
    category: toCategory(stored.categoryName),
    amountKES: fromCents(stored.amountKesCents),
    amountUSD: fromCents(stored.amountUsdCents),
    accountNumber: stored.merchantAccount,
    status: 'pending',
    createdAt: new Date(stored.createdAt),
  };
}

export function usePaymentRequestList() {
  const stored = getStoredPaymentRequests();
  const payments: PaymentRequest[] = stored.map(toPaymentRequest);
  return { data: payments, isLoading: false };
}

// ─── Create payment request mutation ─────────────────────────────────────────

interface CreatePaymentRequestInput extends CreatePaymentRequestBody {
  /** Human-readable category name for local storage. */
  categoryName: string;
}

export function useCreatePaymentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryName, ...payload }: CreatePaymentRequestInput) =>
      createPaymentRequest(payload),
    onSuccess: (data, variables) => {
      addStoredPaymentRequest({
        paymentRequestId: data.paymentRequestId,
        paymentId: data.paymentId,
        escrowId: variables.escrowId,
        categoryId: variables.categoryId,
        categoryName: variables.categoryName,
        amountKesCents: variables.amountKesCents,
        amountUsdCents: variables.amountUsdCents,
        merchantName: variables.merchantName,
        merchantAccount: variables.merchantAccount,
        createdAt: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['payment-request'] });
      queryClient.invalidateQueries({ queryKey: ['escrow'] });
    },
  });
}

// ─── Sender: Pending Payment Requests ─────────────────────────────────────────

export function useSenderPaymentRequests(status: string = 'pending_approval') {
  return useQuery({
    queryKey: ['sender-payment-requests', status],
    queryFn: () => getSenderPaymentRequests(status),
  });
}

export function useApprovePaymentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentRequestId: string) => approvePaymentRequest(paymentRequestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sender-payment-requests'] });
      queryClient.invalidateQueries({ queryKey: ['escrow'] });
    },
  });
}

export function useRejectPaymentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentRequestId, reason }: { paymentRequestId: string; reason?: string }) =>
      rejectPaymentRequest(paymentRequestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sender-payment-requests'] });
    },
  });
}

export function useExecutePaymentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentRequestId: string) => executePaymentRequest(paymentRequestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sender-payment-requests'] });
      queryClient.invalidateQueries({ queryKey: ['payment-request'] });
      queryClient.invalidateQueries({ queryKey: ['escrow'] });
    },
  });
}
