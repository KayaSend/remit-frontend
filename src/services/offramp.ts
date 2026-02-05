import { apiPost, toInternationalPhone } from './api';
import type { OfframpRequest, OfframpResponse } from '@/types/api';

/**
 * Disburse KES to a recipient via M-Pesa.
 * Only call this after payment status reaches `onchain_done_offramp_pending`.
 * Phone is auto-converted to the required +254XXXXXXXXX format.
 */
export function initiateOfframp(
  paymentRequestId: string,
  phone: string,
  amountKes: number,
  transactionHash: string,
) {
  return apiPost<OfframpResponse>('/offramp/pay', {
    paymentRequestId,
    phoneNumber: toInternationalPhone(phone),
    amountKes,
    transactionHash,
  } satisfies OfframpRequest);
}
