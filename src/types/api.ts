// ─── Auth ────────────────────────────────────────────────────────────────────

export interface SendOtpRequest {
  phone: string;
}

export interface SendOtpResponse {
  success: boolean;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  token: string;
}

// ─── Escrow ──────────────────────────────────────────────────────────────────

export interface EscrowCategory {
  name: string;
  amountUsd: number;
}

export interface CreateEscrowRequest {
  recipientPhone: string;
  totalAmountUsd: number;
  categories: EscrowCategory[];
}

export interface CreateEscrowResponse {
  escrowId: string;
  status: string;
  totalAmountUsd: number;
}

export interface EscrowCategoryDetail {
  name: string;
  remainingUsd: number;
}

export interface EscrowDetailResponse {
  escrowId: string;
  status: string;
  spentUsd: number;
  categories: EscrowCategoryDetail[];
}

// ─── Payment Requests ────────────────────────────────────────────────────────

export type PaymentRequestStatus =
  | 'pending'
  | 'onchain_pending'
  | 'onchain_done_offramp_pending'
  | 'completed';

export interface CreatePaymentRequestBody {
  escrowId: string;
  categoryId: string;
  amountKesCents: number;
  amountUsdCents: number;
  exchangeRate: number;
  merchantName: string;
  merchantAccount: string;
}

export interface CreatePaymentRequestResponse {
  success: boolean;
  paymentRequestId: string;
  paymentId: string;
  status: PaymentRequestStatus;
}

export interface PaymentRequestDetailData {
  payment_request_id: string;
  status: PaymentRequestStatus;
  onchain_status: string;
  transaction_hash: string | null;
  offramp_status: string;
  contract_address: string | null;
  smart_contract_enabled: boolean;
}

export interface PaymentRequestDetailResponse {
  success: boolean;
  data: PaymentRequestDetailData;
}

// ─── On-Ramp (M-Pesa → Escrow) ──────────────────────────────────────────────

export interface OnrampRequest {
  phone_number: string; // 0XXXXXXXXX format
  escrow_id: string;
}

export interface OnrampResponse {
  message: string;
  transaction_code: string;
}

// ─── Funding Intent (new flow: pay first, escrow created on confirmation) ───

export interface FundingIntentRequest {
  phone_number: string; // 0XXXXXXXXX format (sender's M-Pesa)
  recipient_phone: string; // +254XXXXXXXXX format
  total_amount_usd: number;
  categories: EscrowCategory[];
  memo?: string;
}

export interface FundingIntentResponse {
  message: string;
  transaction_code: string;
  intent_id: string;
}

export interface FundingIntentStatusResponse {
  success: boolean;
  intentId: string;
  status: 'pending' | 'confirmed' | 'failed' | 'timeout';
  escrowId: string | null;
}

// ─── Off-Ramp (Escrow → M-Pesa) ─────────────────────────────────────────────

export interface OfframpRequest {
  paymentRequestId: string;
  phoneNumber: string; // +254 format
  amountKes: number;
  transactionHash: string;
}

export interface OfframpResponse {
  message: string;
  transactionCode: string;
  amountKes: number;
}

// ─── Recipients ──────────────────────────────────────────────────────────────

export interface DailySpendResponse {
  dailyLimitUsd: number;
  spentTodayUsd: number;
  remainingTodayUsd: number;
  transactionCount: number;
  lastTransactionAt: string | null;
}

export interface RecipientDashboardCategory {
  category: string;
  escrowId: string;
  categoryId: string;
  allocatedUsd: number;
  spentUsd: number;
  remainingUsd: number;
  dailyLimitUsd: number | null;
  escrowCount: number;
}

export interface RecipientDashboardEscrow {
  escrowId: string;
  totalUsd: number;
  remainingUsd: number;
  expiresAt: string;
  categories: string[];
}

export interface RecipientDashboardData {
  recipient: {
    id: string;
    phone: string;
    name: string;
  };
  dailySpend: {
    limitUsd: number;
    spentTodayUsd: number;
    remainingTodayUsd: number;
    transactionCount: number;
  };
  categories: RecipientDashboardCategory[];
  activeEscrows: RecipientDashboardEscrow[];
}

export interface RecipientDashboardResponse {
  success: boolean;
  data: RecipientDashboardData;
}

// ─── Blockchain ──────────────────────────────────────────────────────────────

export interface BlockchainStatusData {
  monitoring: {
    isActive: boolean;
    lastChecked: string;
  };
  contract_balance_usd: number;
  wallet_balance_usdc: number;
}

export interface BlockchainStatusResponse {
  success: boolean;
  data: BlockchainStatusData;
}

export interface BlockchainEscrowDatabase {
  escrowId: string;
  status: string;
  totalAmountUsd: number;
  remainingBalanceUsd: number;
  spentUsd: number;
  contractAddress: string;
  createdAt: string;
  expiresAt: string;
}

export interface BlockchainEscrowOnChain {
  exists: boolean;
  isActive: boolean;
  isRefunded: boolean;
  remainingAmountEth: string;
  releasedAmountEth: string;
  purpose?: string;
}

export interface BlockchainEscrowResponse {
  success: boolean;
  data: {
    database: BlockchainEscrowDatabase;
    blockchain: BlockchainEscrowOnChain;
  };
}

export interface VerifyPaymentRequest {
  paymentId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  data: {
    paymentId: string;
    used: boolean;
    message: string;
  };
}

// ─── Health ──────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
}

// ─── Sender Payment Approvals ─────────────────────────────────────────────────

export interface PendingPaymentRequest {
  paymentRequestId: string;
  escrowId: string;
  categoryId: string;
  categoryName: string;
  amountKesCents: number;
  amountUsdCents: number;
  amountKes: number;
  amountUsd: number;
  exchangeRate: number;
  merchantName: string | null;
  merchantAccount: string | null;
  recipientPhone: string | null;
  recipientName: string | null;
  status: string;
  createdAt: string;
}

export interface PendingPaymentRequestsResponse {
  success: boolean;
  data: PendingPaymentRequest[];
  count: number;
}

export interface ApproveRejectResponse {
  success: boolean;
  message: string;
  paymentRequestId: string;
}

export interface ExecutePaymentResponse {
  success: boolean;
  message: string;
  paymentRequestId: string;
  transactionCode: string;
  transactionHash: string;
  amountKes: number;
  status: string;
}

// ─── Shared ──────────────────────────────────────────────────────────────────

export interface ApiErrorBody {
  error: string;
  message?: string;
}
