import { apiGet, apiPost } from './api';
import type {
  BlockchainStatusResponse,
  BlockchainEscrowResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  HealthResponse,
} from '@/types/api';

/** Check if the backend is operational. */
export function getHealth() {
  return apiGet<HealthResponse>('/health', { public: true });
}

/** Get blockchain monitoring and contract status. */
export function getBlockchainStatus() {
  return apiGet<BlockchainStatusResponse>('/blockchain/status');
}

/** Get combined database + on-chain details for an escrow. */
export function getBlockchainEscrow(escrowId: string) {
  return apiGet<BlockchainEscrowResponse>(`/blockchain/escrow/${escrowId}`);
}

/** Check if a payment ID has been used on-chain. */
export function verifyPayment(paymentId: string) {
  return apiPost<VerifyPaymentResponse>('/blockchain/verify-payment', {
    paymentId,
  } satisfies VerifyPaymentRequest);
}
