import { apiGet, apiPost } from './api';
import type { DailySpendResponse, RecipientDashboardResponse } from '@/types/api';

/** Get the daily spending status for a recipient. */
export function getDailySpend(recipientId: string) {
  return apiGet<DailySpendResponse>(`/recipients/${recipientId}/daily-spend`);
}

/** Get the full dashboard data for the authenticated recipient. */
export function getRecipientDashboard() {
  return apiGet<RecipientDashboardResponse>('/recipients/me/dashboard');
}

/** Option B: link the authenticated user to a recipient record (one-time). */
export function claimRecipient() {
  return apiPost<{ success: true; recipientId: string }>('/recipients/me/claim');
}
