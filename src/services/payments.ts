import { apiGet, apiPost } from './api';
import type {
  CreatePaymentRequestBody,
  CreatePaymentRequestResponse,
  PaymentRequestDetailResponse,
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
