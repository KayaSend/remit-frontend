import { apiGet, apiPost } from './api';
import type {
  CreateEscrowRequest,
  CreateEscrowResponse,
  EscrowDetailResponse,
} from '@/types/api';

/** Create a new escrow with category-based spending controls. */
export function createEscrow(payload: CreateEscrowRequest) {
  return apiPost<CreateEscrowResponse>('/escrows/', payload);
}

/** Retrieve escrow details and per-category spending status. */
export function getEscrow(escrowId: string) {
  return apiGet<EscrowDetailResponse>(`/escrows/${escrowId}`);
}
