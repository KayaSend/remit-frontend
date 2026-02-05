import { apiPost, toLocalPhone } from './api';
import type { OnrampResponse } from '@/types/api';

/**
 * Initiate M-Pesa STK push to fund an escrow.
 * Phone is auto-converted to the required 0XXXXXXXXX format.
 */
export function initiateOnramp(phone: string, escrowId: string) {
  return apiPost<OnrampResponse>('/onramp/kes', {
    phone_number: toLocalPhone(phone),
    escrow_id: escrowId,
  });
}
