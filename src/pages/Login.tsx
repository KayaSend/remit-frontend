import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowRight, Shield } from 'lucide-react';
import { useLoginWithEmail } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useRole } from '@/hooks/useRole';
import { setAuthToken } from '@/services/api';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') as 'sender' | 'recipient' | null;
  const { setRole } = useRole();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const { sendCode, loginWithCode, state } = useLoginWithEmail({
    onComplete: () => {
      const targetRole = role || 'sender';
      setRole(targetRole);
      // Phase 1: Set mock backend token after Privy auth succeeds
      setAuthToken('mock-jwt-token');
      navigate(targetRole === 'sender' ? '/sender' : '/recipient');
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  const handleSendCode = async () => {
    if (!email) return;
    await sendCode({ email });
  };

  const handleVerifyCode = async () => {
    if (otp.length !== 6) return;
    await loginWithCode({ code: otp });
  };

  const showOtpStep =
    state.status === 'awaiting-code-input' || state.status === 'submitting-code';
  const isLoading = state.status === 'sending-code' || state.status === 'submitting-code';
  const errorMessage = state.status === 'error' ? state.error?.message : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 px-4">
        <div className="container max-w-md mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to Remit</h1>
          <p className="text-primary-foreground/80">
            Sign in to {role === 'recipient' ? 'access your funds' : 'start sending'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container max-w-md mx-auto px-4 py-8">
        {!showOtpStep ? (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-accent-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Enter your email
              </h2>
              <p className="text-sm text-muted-foreground">
                We'll send you a verification code
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-destructive text-center">{errorMessage}</p>
            )}

            <Button
              className="w-full h-12 text-base"
              disabled={!email || isLoading}
              onClick={handleSendCode}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Enter verification code
              </h2>
              <p className="text-sm text-muted-foreground">
                Code sent to {email}
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {errorMessage && (
              <p className="text-sm text-destructive text-center">{errorMessage}</p>
            )}

            <Button
              className="w-full h-12 text-base"
              disabled={otp.length < 6 || isLoading}
              onClick={handleVerifyCode}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                'Verify & Sign In'
              )}
            </Button>

            <button
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => {
                setOtp('');
                handleSendCode();
              }}
            >
              Resend code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
