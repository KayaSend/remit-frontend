import { apiGet, apiPost } from './api';
import type {
  CreatePaymentRequestBody,
  CreatePaymentRequestResponse,
  PaymentRequestDetailResponse,
  PendingPaymentRequestsResponse,
  ApproveRejectResponse,
} from '@/types/api';

/** Submit a payment request against an escrow category. */
export function createPaymentRequest(payload: CreatePaymentRequestBody) {
  return apiPost<CreatePaymentRequestResponse>('/payment-requests', payload);
}

/** Get the current status of a payment request (used for polling). */
export function getPaymentRequest(paymentRequestId: string) {
  return apiGet<PaymentRequestDetailResponse>(
    `/payment-requests/${paymentRequestId}`,
  );
}

/** Get all pending payment requests for the sender to approve/reject. */
export function getSenderPaymentRequests(status: string = 'pending_approval') {
  return apiGet<PendingPaymentRequestsResponse>(
    `/sender/payment-requests?status=${status}`,
  );
}

/** Approve a payment request. */
export function approvePaymentRequest(paymentRequestId: string) {
  return apiPost<ApproveRejectResponse>(
    `/payment-requests/${paymentRequestId}/approve`,
    {},
  );
}

/** Reject a payment request. */
export function rejectPaymentRequest(paymentRequestId: string, reason?: string) {
  return apiPost<ApproveRejectResponse>(
    `/payment-requests/${paymentRequestId}/reject`,
    { reason },
  );
}
