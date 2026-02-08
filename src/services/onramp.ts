import { apiGet, apiPost, toLocalPhone, toInternationalPhone } from './api';
import type {
  OnrampResponse,
  FundingIntentResponse,
  FundingIntentStatusResponse,
  EscrowCategory,
} from '@/types/api';

// ─── Legacy: Initiate on-ramp for an existing escrow ─────────────────────────

/**
 * Initiate M-Pesa STK push to fund an existing escrow.
 * Phone is auto-converted to the required 0XXXXXXXXX format.
 */
export function initiateOnramp(phone: string, escrowId: string) {
  return apiPost<OnrampResponse>('/onramp/kes', {
    phone_number: toLocalPhone(phone),
    escrow_id: escrowId,
  });
}

// ─── New flow: Funding Intent (escrow created after payment confirmation) ───

export interface CreateFundingIntentInput {
  senderPhone: string; // any format, will be normalized to 0XXXXXXXXX
  recipientPhone: string; // any format, will be normalized to +254XXXXXXXXX
  totalAmountUsd: number;
  categories: EscrowCategory[];
  memo?: string;
}

/**
 * Create a funding intent and trigger M-Pesa STK push.
 * The escrow is NOT created yet — it will be created by the backend
 * when the Pretium webhook confirms payment.
 */
export function createFundingIntent(input: CreateFundingIntentInput) {
  return apiPost<FundingIntentResponse>('/onramp/kes/intent', {
    phone_number: toLocalPhone(input.senderPhone),
    recipient_phone: toInternationalPhone(input.recipientPhone),
    total_amount_usd: input.totalAmountUsd,
    categories: input.categories,
    memo: input.memo,
  });
}

/**
 * Poll the status of a funding intent by its transaction code.
 * Returns the escrowId once payment is confirmed.
 */
export function getFundingIntentStatus(transactionCode: string) {
  return apiGet<FundingIntentStatusResponse>(
    `/onramp/kes/status/${encodeURIComponent(transactionCode)}`,
  );
}
