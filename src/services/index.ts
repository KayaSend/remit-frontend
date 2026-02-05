// Re-export all services for convenient imports:
//   import { sendOtp, createEscrow, ApiError } from '@/services'

export {
  apiRequest,
  apiGet,
  apiPost,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  toCents,
  fromCents,
  isValidKenyanPhone,
  toLocalPhone,
  toInternationalPhone,
  ApiError,
} from './api';

export { sendOtp, verifyOtp } from './auth';
export { createEscrow, getEscrow } from './escrow';
export { createPaymentRequest, getPaymentRequest } from './payments';
export { initiateOnramp } from './onramp';
export { initiateOfframp } from './offramp';
export { getDailySpend } from './recipients';
export {
  getHealth,
  getBlockchainStatus,
  getBlockchainEscrow,
  verifyPayment,
} from './blockchain';
