import { apiPost, setAuthToken } from './api';
import type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '@/types/api';

/** Send an OTP to the given Kenyan phone number. */
export function sendOtp(phone: string) {
  return apiPost<SendOtpResponse>(
    '/auth/send-otp',
    { phone } satisfies SendOtpRequest,
    { public: true },
  );
}

/**
 * Verify the OTP and store the returned JWT.
 * The token is automatically persisted to localStorage.
 */
export async function verifyOtp(phone: string, otp: string) {
  const data = await apiPost<VerifyOtpResponse>(
    '/auth/verify-otp',
    { phone, otp } satisfies VerifyOtpRequest,
    { public: true },
  );

  setAuthToken(data.token);
  return data;
}
