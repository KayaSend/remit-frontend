import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { sendOtp, verifyOtp } from '@/services/auth';
import { isValidKenyanPhone, toInternationalPhone } from '@/services/api';
import { handleApiError } from '@/lib/error-handler';

export default function RecipientLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /** The full phone in +254 format for API calls. */
  const fullPhone = toInternationalPhone(`0${phone}`);

  const handleSendOtp = async () => {
    if (!isValidKenyanPhone(`0${phone}`)) {
      setError('Enter a valid 9-digit Kenyan phone number');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await sendOtp(fullPhone);
      toast.success('Verification code sent');
      setStep('otp');
    } catch (err) {
      const errorInfo = handleApiError(err, {
        customMessage: 'Failed to send verification code',
        context: 'RecipientLogin:SendOTP',
      });
      setError(errorInfo.userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;

    setError('');
    setIsLoading(true);
    try {
      await verifyOtp(fullPhone, otp);
      toast.success('Signed in successfully');
      navigate('/recipient');
    } catch (err) {
      const errorInfo = handleApiError(err, {
        customMessage: 'Verification failed',
        context: 'RecipientLogin:VerifyOTP',
        onRedirect: (path) => navigate(path),
      });
      setError(errorInfo.userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 px-4">
        <div className="container max-w-md mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-primary-foreground/80">
            Sign in to access your funds
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container max-w-md mx-auto px-4 py-8">
        {step === 'phone' ? (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-accent-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Enter your phone number
              </h2>
              <p className="text-sm text-muted-foreground">
                We'll send you a verification code
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-muted rounded-lg border border-input">
                  <span className="text-muted-foreground font-medium">+254</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="712 345 678"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 9));
                    setError('');
                  }}
                  className="flex-1 h-12 text-lg"
                />
              </div>
              {error && step === 'phone' && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}
            </div>

            <Button
              className="w-full h-12 text-base"
              disabled={phone.length < 9 || isLoading}
              onClick={handleSendOtp}
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
                Code sent to +254 {phone}
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  setError('');
                }}
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

            {error && (
              <p className="text-sm text-destructive text-center flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}

            <Button
              className="w-full h-12 text-base"
              disabled={otp.length < 6 || isLoading}
              onClick={handleVerifyOtp}
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
                setStep('phone');
                setOtp('');
                setError('');
              }}
            >
              Use a different number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
