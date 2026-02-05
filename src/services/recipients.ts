import { apiGet } from './api';
import type { DailySpendResponse } from '@/types/api';

/** Get the daily spending status for a recipient. */
export function getDailySpend(recipientId: string) {
  return apiGet<DailySpendResponse>(`/recipients/${recipientId}/daily-spend`);
}
