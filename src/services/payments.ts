import { apiGet, apiPost } from './api';
import type {
  CreatePaymentRequestBody,
  CreatePaymentRequestResponse,
  PaymentRequestDetailResponse,
  PendingPaymentRequestsResponse,
  ApproveRejectResponse,
  ExecutePaymentResponse,
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

/** Execute an approved payment request (initiate M-Pesa off-ramp). */
export function executePaymentRequest(paymentRequestId: string) {
  return apiPost<ExecutePaymentResponse>(
    `/payment-requests/${paymentRequestId}/execute`,
    {},
  );
}

/** Get all payment requests across all statuses (for payment history). */
export async function getAllSenderPaymentRequests() {
  const statuses: string[] = ['completed', 'processing', 'approved', 'pending_approval', 'rejected', 'failed'];
  
  const responses = await Promise.all(
    statuses.map(status => 
      getSenderPaymentRequests(status).catch(() => ({ success: true, data: [], count: 0 }))
    )
  );
  
  // Merge all results
  const allPaymentRequests = responses.flatMap(response => response.data || []);
  
  return {
    success: true,
    data: allPaymentRequests,
    count: allPaymentRequests.length,
  };
}
