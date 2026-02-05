/**
 * Lightweight localStorage store for tracking escrow and payment-request IDs
 * created in this browser session. Used to power list views until the API
 * provides dedicated list endpoints.
 */

// ─── Escrows ─────────────────────────────────────────────────────────────────

const ESCROW_STORE_KEY = 'remit-escrows';

export interface StoredEscrow {
  escrowId: string;
  recipientPhone: string;
  totalAmountUsd: number;
  categories: { name: string; amountUsd: number }[];
  createdAt: string;
}

export function getStoredEscrows(): StoredEscrow[] {
  try {
    const raw = localStorage.getItem(ESCROW_STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addStoredEscrow(escrow: StoredEscrow): void {
  const current = getStoredEscrows();
  if (!current.some((e) => e.escrowId === escrow.escrowId)) {
    localStorage.setItem(
      ESCROW_STORE_KEY,
      JSON.stringify([escrow, ...current]),
    );
  }
}

// ─── Payment Requests ────────────────────────────────────────────────────────

const PAYMENT_STORE_KEY = 'remit-payment-requests';

export interface StoredPaymentRequest {
  paymentRequestId: string;
  paymentId: string;
  escrowId: string;
  categoryId: string;
  categoryName: string;
  amountKesCents: number;
  amountUsdCents: number;
  merchantName: string;
  merchantAccount: string;
  createdAt: string;
}

export function getStoredPaymentRequests(): StoredPaymentRequest[] {
  try {
    const raw = localStorage.getItem(PAYMENT_STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addStoredPaymentRequest(pr: StoredPaymentRequest): void {
  const current = getStoredPaymentRequests();
  if (!current.some((p) => p.paymentRequestId === pr.paymentRequestId)) {
    localStorage.setItem(
      PAYMENT_STORE_KEY,
      JSON.stringify([pr, ...current]),
    );
  }
}
