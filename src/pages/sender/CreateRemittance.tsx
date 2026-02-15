import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Phone, DollarSign, Zap, Droplets, Home, GraduationCap, ShoppingCart, Heart, Package, Smartphone, AlertCircle, CheckCircle2, Edit2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, type Category } from '@/types/remittance';
import { toast } from 'sonner';
import { useCreateFundingIntent, getFundingIntentStatus } from '@/hooks/useOnramp';
import { isValidKenyanPhone, toInternationalPhone } from '@/services/api';
import { PaymentOverlay, type PaymentPhase } from '@/components/sender/PaymentOverlay';
import { addStoredEscrow } from '@/lib/local-store';
import { shouldRetry } from '@/lib/error-handler';

const steps = ['Recipient', 'Amount', 'Allocate', 'Review'];

const POLL_INTERVAL_MS = 3_000;
const TIMEOUT_SECONDS = 90;

const categoryIcons: Record<Category, typeof Zap> = {
  electricity: Zap,
  water: Droplets,
  rent: Home,
  food: ShoppingCart,
  medical: Heart,
  education: GraduationCap,
  other: Package,
};

const categoryColors: Record<Category, string> = {
  electricity: 'border-category-electricity bg-category-electricity/5',
  water: 'border-category-water bg-category-water/5',
  rent: 'border-category-rent bg-category-rent/5',
  food: 'border-category-food bg-category-food/5',
  medical: 'border-category-medical bg-category-medical/5',
  education: 'border-category-education bg-category-education/5',
  other: 'border-category-other bg-category-other/5',
};

const categoryIconBg: Record<Category, string> = {
  electricity: 'bg-category-electricity/10 text-category-electricity',
  water: 'bg-category-water/10 text-category-water',
  rent: 'bg-category-rent/10 text-category-rent',
  food: 'bg-category-food/10 text-category-food',
  medical: 'bg-category-medical/10 text-category-medical',
  education: 'bg-category-education/10 text-category-education',
  other: 'bg-category-other/10 text-category-other',
};

interface Allocation {
  category: Category;
  amount: number;
  dailyLimit: number;
  enabled: boolean;
}

interface AllocationTemplate {
  name: string;
  description: string;
  icon: typeof Sparkles;
  allocations: { category: Category; percentage: number; dailyLimit?: number }[];
}

const ALLOCATION_TEMPLATES: AllocationTemplate[] = [
  {
    name: 'Essentials',
    description: 'Basic needs coverage',
    icon: Home,
    allocations: [
      { category: 'rent', percentage: 50 },
      { category: 'electricity', percentage: 15, dailyLimit: 15 },
      { category: 'water', percentage: 15, dailyLimit: 10 },
      { category: 'food', percentage: 20, dailyLimit: 20 },
    ],
  },
  {
    name: 'Flexible',
    description: 'Unrestricted spending',
    icon: Package,
    allocations: [
      { category: 'other', percentage: 100, dailyLimit: 25 },
    ],
  },
  {
    name: 'Family Support',
    description: 'Education & healthcare',
    icon: Heart,
    allocations: [
      { category: 'education', percentage: 40 },
      { category: 'medical', percentage: 30, dailyLimit: 25 },
      { category: 'food', percentage: 30, dailyLimit: 20 },
    ],
  },
];

export default function CreateRemittance() {
  const navigate = useNavigate();
  const createFundingIntent = useCreateFundingIntent();

  const isProcessing = createFundingIntent.isPending;

  const [step, setStep] = useState(0);
  const [prevStep, setPrevStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [allocations, setAllocations] = useState<Allocation[]>([
    { category: 'electricity', amount: 0, dailyLimit: 15, enabled: false },
    { category: 'water', amount: 0, dailyLimit: 10, enabled: false },
    { category: 'rent', amount: 0, dailyLimit: 0, enabled: false },
    { category: 'food', amount: 0, dailyLimit: 20, enabled: false },
    { category: 'medical', amount: 0, dailyLimit: 25, enabled: false },
    { category: 'education', amount: 0, dailyLimit: 0, enabled: false },
    { category: 'other', amount: 0, dailyLimit: 10, enabled: false },
  ]);
  const [useSliders, setUseSliders] = useState(true); // Toggle between sliders and inputs

  // Track step direction for animations
  const stepDirection = step > prevStep ? 'forward' : 'backward';
  const stepAnimation = stepDirection === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left';

  // Helper to change step with prev tracking
  const changeStep = (newStep: number) => {
    setPrevStep(step);
    setStep(newStep);
  };

  // Payment overlay state
  const [showOverlay, setShowOverlay] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>('processing');
  const [transactionCode, setTransactionCode] = useState<string | undefined>();
  const [confirmedEscrowId, setConfirmedEscrowId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Keep a ref to the intent payload so we can persist it after confirmation
  const intentPayloadRef = useRef<{
    recipientPhone: string;
    totalAmountUsd: number;
    categories: { name: string; amountUsd: number }[];
  } | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
  const remaining = Number(totalAmount) - totalAllocated;

  // Load saved draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('remittance-draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const now = Date.now();
        const draftAge = now - (draft.timestamp || 0);
        // Only restore if draft is less than 1 hour old
        if (draftAge < 60 * 60 * 1000) {
          setPhone(draft.phone || '');
          setSenderPhone(draft.senderPhone || '');
          setTotalAmount(draft.totalAmount || '');
          if (draft.allocations) setAllocations(draft.allocations);
          if (draft.step) changeStep(draft.step);
          toast.success('Draft restored from your last session');
        } else {
          // Clear old draft
          localStorage.removeItem('remittance-draft');
        }
      } catch (error) {
        console.error('Failed to restore draft:', error);
      }
    }
  }, []);

  // Auto-save draft to localStorage whenever form state changes
  useEffect(() => {
    const draft = {
      phone,
      senderPhone,
      totalAmount,
      allocations,
      step,
      timestamp: Date.now(),
    };
    localStorage.setItem('remittance-draft', JSON.stringify(draft));
  }, [phone, senderPhone, totalAmount, allocations, step]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  /**
   * Poll the funding intent status by transaction_code.
   * Once status is 'confirmed', the backend has created the escrow.
   */
  const startPolling = useCallback((txCode: string) => {
    stopPolling();
    setElapsedSeconds(0);

    const startTime = Date.now();
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 5;

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);
      if (elapsed >= TIMEOUT_SECONDS) {
        stopPolling();
        setPaymentPhase('timeout');
      }
    }, 1000);

    pollRef.current = setInterval(async () => {
      try {
        const res = await getFundingIntentStatus(txCode);
        
        // Reset error counter on successful poll
        consecutiveErrors = 0;

        if (res.status === 'confirmed' && res.escrowId) {
          stopPolling();
          setConfirmedEscrowId(res.escrowId);
          setPaymentPhase('success');

          // Clear the draft from localStorage since payment succeeded
          localStorage.removeItem('remittance-draft');

          // Persist to localStorage now that the escrow is real
          if (intentPayloadRef.current) {
            addStoredEscrow({
              escrowId: res.escrowId,
              recipientPhone: intentPayloadRef.current.recipientPhone,
              totalAmountUsd: intentPayloadRef.current.totalAmountUsd,
              categories: intentPayloadRef.current.categories,
              createdAt: new Date().toISOString(),
            });
          }
        } else if (res.status === 'failed') {
          stopPolling();
          setErrorMessage('Payment failed. Please try again.');
          setPaymentPhase('error');
        }
        // 'pending' → keep polling
      } catch (error) {
        // Increment error counter
        consecutiveErrors++;
        
        // Log error for debugging
        console.error('[CreateRemittance:Polling]', {
          error,
          consecutiveErrors,
          isRetryable: shouldRetry(error),
        });

        // If we've had too many consecutive errors, stop polling and show error
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          stopPolling();
          const msg = error instanceof Error ? error.message : 'Failed to check payment status';
          setErrorMessage(`${msg}. Please retry.`);
          setPaymentPhase('error');
          toast.error('Unable to verify payment status. Please try again.');
        }
        // Otherwise, silently retry on next interval
      }
    }, POLL_INTERVAL_MS);
  }, [stopPolling]);

  const handleAllocationChange = (category: Category, field: 'amount' | 'dailyLimit', value: number) => {
    setAllocations(prev => prev.map(a =>
      a.category === category
        ? { ...a, [field]: value, enabled: field === 'amount' ? value > 0 : a.enabled }
        : a
    ));
  };

  const toggleCategory = (category: Category) => {
    setAllocations(prev => prev.map(a =>
      a.category === category ? { ...a, enabled: !a.enabled, amount: !a.enabled ? 0 : a.amount } : a
    ));
  };

  const allocateEvenly = () => {
    const enabledCategories = allocations.filter(a => a.enabled);
    if (enabledCategories.length === 0) {
      toast.error('Please select at least one category first');
      return;
    }
    
    const amountPerCategory = Number(totalAmount) / enabledCategories.length;
    setAllocations(prev => prev.map(a =>
      a.enabled ? { ...a, amount: Number(amountPerCategory.toFixed(2)) } : a
    ));
    toast.success(`Allocated $${amountPerCategory.toFixed(2)} to each category`);
  };

  const applyTemplate = (template: AllocationTemplate) => {
    const total = Number(totalAmount);
    const newAllocations = allocations.map(a => {
      const templateAlloc = template.allocations.find(ta => ta.category === a.category);
      if (templateAlloc) {
        const amount = Number(((total * templateAlloc.percentage) / 100).toFixed(2));
        return {
          ...a,
          amount,
          dailyLimit: templateAlloc.dailyLimit ?? a.dailyLimit,
          enabled: true,
        };
      }
      return { ...a, amount: 0, enabled: false };
    });
    setAllocations(newAllocations);
    toast.success(`Applied "${template.name}" template`);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return isValidKenyanPhone(`0${phone}`);
      case 1: return Number(totalAmount) >= 1;
      case 2: return totalAllocated > 0 && remaining >= 0;
      case 3: return isValidKenyanPhone(`0${senderPhone}`) && !isProcessing;
      default: return false;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const canProgress = canProceed();

      switch (e.key) {
        case 'ArrowRight':
          if (step < steps.length - 1 && canProgress) {
            e.preventDefault();
            changeStep(step + 1);
          }
          break;
        case 'ArrowLeft':
          if (step > 0) {
            e.preventDefault();
            changeStep(step - 1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, phone, senderPhone, totalAmount, totalAllocated, remaining, isProcessing]);

  /**
   * New flow: Create funding intent → STK push sent → poll for confirmation.
   * Escrow is created on the backend ONLY after payment is confirmed.
   */
  const handleConfirmAndPay = async () => {
    const enabledAllocations = allocations.filter(a => a.enabled && a.amount > 0);

    const payload = {
      senderPhone: `0${senderPhone}`,
      recipientPhone: toInternationalPhone(`0${phone}`),
      totalAmountUsd: Number(totalAmount),
      categories: enabledAllocations.map(a => ({
        name: a.category,
        amountUsd: a.amount,
      })),
    };

    // Store for later persistence
    intentPayloadRef.current = {
      recipientPhone: payload.recipientPhone,
      totalAmountUsd: payload.totalAmountUsd,
      categories: payload.categories,
    };

    setShowOverlay(true);
    setPaymentPhase('processing');
    setErrorMessage(undefined);
    setTransactionCode(undefined);
    setConfirmedEscrowId(null);

    try {
      const data = await createFundingIntent.mutateAsync(payload);
      setTransactionCode(data.transaction_code);
      setPaymentPhase('waiting');
      startPolling(data.transaction_code);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to initiate payment.';
      toast.error(msg);
      setErrorMessage(msg);
      setPaymentPhase('error');
    }
  };

  /** Retry: create a new funding intent (same payload). */
  const handleRetry = async () => {
    if (!intentPayloadRef.current) return;

    setPaymentPhase('processing');
    setErrorMessage(undefined);
    setElapsedSeconds(0);

    try {
      const data = await createFundingIntent.mutateAsync({
        senderPhone: `0${senderPhone}`,
        recipientPhone: intentPayloadRef.current.recipientPhone,
        totalAmountUsd: intentPayloadRef.current.totalAmountUsd,
        categories: intentPayloadRef.current.categories,
      });
      setTransactionCode(data.transaction_code);
      setPaymentPhase('waiting');
      startPolling(data.transaction_code);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to initiate payment.';
      toast.error(msg);
      setErrorMessage(msg);
      setPaymentPhase('error');
    }
  };

  return (
    <AppLayout hideNav>
      <div className="container px-4 py-6 pb-32">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => step > 0 ? changeStep(step - 1) : navigate('/sender')}
            className="touch-target"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-h3 text-foreground">Send Money</h1>
            <p className="text-smaller text-muted-foreground">Step {step + 1} of {steps.length}: {steps[step]}</p>
          </div>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={steps.length} aria-label={`Step ${step + 1} of ${steps.length}: ${steps[step]}`}>
            {steps.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    disabled={i > step}
                    onClick={() => i <= step && changeStep(i)}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300',
                      i < step && 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer',
                      i === step && 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110 cursor-default',
                      i > step && 'bg-muted text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    {i < step ? <Check className="w-5 h-5" /> : i + 1}
                  </button>
                  {/* Step Label - Hidden on mobile for space */}
                  <span className={cn(
                    'text-xs mt-2 font-medium hidden sm:block transition-colors',
                    i <= step ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {label}
                  </span>
                </div>
                
                {/* Connecting Line */}
                {i < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={cn(
                        'h-full transition-all duration-500 rounded-full',
                        i < step ? 'w-full bg-primary' : 'w-0 bg-primary'
                      )}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Progress Percentage */}
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">{Math.round(((step + 1) / steps.length) * 100)}%</span> Complete
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Recipient */}
          {step === 0 && (
            <div className={cn("space-y-6", stepAnimation)}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-accent-foreground" aria-hidden="true" />
                </div>
                <h2 className="text-h2 text-foreground mb-2">Who are you sending to?</h2>
                <p className="text-small text-muted-foreground">Enter their Kenya phone number</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone" className="text-small font-medium">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-4 bg-secondary rounded-xl border border-input">
                    <span className="text-muted-foreground font-medium">+254</span>
                  </div>
                  <div className="relative flex-1">
                    <Input
                      id="phone"
                      name="recipientPhone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="712 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      className={cn(
                        "h-12 text-lg pr-10",
                        phone.length > 0 && (isValidKenyanPhone(`0${phone}`) ? 'border-success' : 'border-destructive')
                      )}
                    />
                    {phone.length > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isValidKenyanPhone(`0${phone}`) ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {phone.length > 0 && !isValidKenyanPhone(`0${phone}`) && (
                  <p className="text-smaller text-destructive flex items-center gap-1 mt-2">
                    <AlertCircle className="w-4 h-4" />
                    Please enter a valid 9-digit Kenya phone number
                  </p>
                )}
                {phone.length > 0 && isValidKenyanPhone(`0${phone}`) && (
                  <p className="text-smaller text-success flex items-center gap-1 mt-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Valid phone number
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Amount */}
          {step === 1 && (
            <div className={cn("space-y-6", stepAnimation)}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-primary" aria-hidden="true" />
                </div>
                <h2 className="text-h2 text-foreground mb-2">How much are you sending?</h2>
                <p className="text-small text-muted-foreground">Choose a preset or enter custom amount</p>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[50, 100, 200, 500].slice(0, 3).map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={Number(totalAmount) === amount ? "default" : "outline"}
                    className={cn(
                      "h-14 text-base font-semibold transition-all",
                      Number(totalAmount) === amount && "ring-2 ring-primary ring-offset-2"
                    )}
                    onClick={() => setTotalAmount(amount.toString())}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[500].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={Number(totalAmount) === amount ? "default" : "outline"}
                    className={cn(
                      "h-14 text-base font-semibold transition-all",
                      Number(totalAmount) === amount && "ring-2 ring-primary ring-offset-2"
                    )}
                    onClick={() => setTotalAmount(amount.toString())}
                  >
                    ${amount}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant={![50, 100, 200, 500].includes(Number(totalAmount)) && Number(totalAmount) > 0 ? "default" : "outline"}
                  className={cn(
                    "h-14 text-base font-semibold transition-all",
                    ![50, 100, 200, 500].includes(Number(totalAmount)) && Number(totalAmount) > 0 && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => {
                    setTotalAmount('');
                    setTimeout(() => document.getElementById('amount')?.focus(), 100);
                  }}
                >
                  Custom
                </Button>
              </div>

              <div className="space-y-3">
                <Label htmlFor="amount" className="text-small font-medium">Or enter custom amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground font-medium">$</span>
                  <Input
                    id="amount"
                    name="totalAmount"
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className={cn(
                      "pl-10 pr-10 text-3xl h-16 font-semibold",
                      Number(totalAmount) > 0 && (Number(totalAmount) >= 1 ? 'border-success' : 'border-destructive')
                    )}
                  />
                  {Number(totalAmount) > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {Number(totalAmount) >= 1 ? (
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-destructive" />
                      )}
                    </div>
                  )}
                </div>
                {Number(totalAmount) > 0 && Number(totalAmount) < 1 && (
                  <p className="text-smaller text-destructive flex items-center gap-1 mt-2">
                    <AlertCircle className="w-4 h-4" />
                    Minimum amount is $1.00
                  </p>
                )}
                {Number(totalAmount) > 0 && (
                  <div className="bg-accent/50 rounded-xl p-4 mt-4">
                    <p className="text-small text-accent-foreground text-center">
                      ≈ <strong>KES {(Number(totalAmount) * 153.5).toLocaleString()}</strong> at current rate
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Allocate */}
          {step === 2 && (
            <div className={cn("space-y-6", stepAnimation)}>
              <div className="text-center mb-6">
                <h2 className="text-h2 text-foreground mb-2">Allocate to categories</h2>
                <p className="text-small text-muted-foreground">Choose a preset or customize</p>
              </div>

              {/* Preset Templates */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {ALLOCATION_TEMPLATES.map((template) => {
                  const TemplateIcon = template.icon;
                  return (
                    <Button
                      key={template.name}
                      type="button"
                      variant="outline"
                      className="h-auto flex-col gap-2 p-3 hover:border-primary hover:bg-primary/5"
                      onClick={() => applyTemplate(template)}
                    >
                      <TemplateIcon className="w-5 h-5 text-primary" />
                      <div className="text-center">
                        <div className="font-semibold text-xs">{template.name}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                          {template.description}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>

              {/* Budget Status */}
              <div className="text-center mb-4">
                <div className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-base',
                  remaining < 0 ? 'bg-destructive/10 text-destructive' : remaining === 0 ? 'bg-success/10 text-success' : 'bg-accent text-accent-foreground'
                )}>
                  {remaining < 0 && <AlertCircle className="w-5 h-5" />}
                  {remaining === 0 && <CheckCircle2 className="w-5 h-5" />}
                  ${Math.abs(remaining).toFixed(2)} {remaining < 0 ? 'over budget' : remaining === 0 ? 'fully allocated' : 'remaining'}
                </div>
                <p className="text-smaller text-muted-foreground mt-2">
                  Total budget: ${totalAmount}
                </p>
                
                {/* Visual Budget Bar */}
                <div className="mt-4 px-4">
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        'h-full transition-all duration-500 rounded-full',
                        remaining < 0 ? 'bg-destructive' : remaining === 0 ? 'bg-success' : 'bg-primary'
                      )}
                      style={{ 
                        width: `${Math.min((totalAllocated / Number(totalAmount)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>${totalAllocated.toFixed(2)} allocated</span>
                    <span>{Math.min(Math.round((totalAllocated / Number(totalAmount)) * 100), 100)}%</span>
                  </div>
                </div>

                {/* Quick Action Button */}
                {allocations.some(a => a.enabled) && remaining > 0 && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={allocateEvenly}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Allocate Evenly to Selected Categories
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {allocations.map((allocation) => {
                  const Icon = categoryIcons[allocation.category];
                  const isOneTime = allocation.category === 'rent' || allocation.category === 'education';

                  return (
                    <Card
                      key={allocation.category}
                      className={cn(
                        'border-2 transition-colors duration-300 cursor-pointer overflow-hidden',
                        allocation.enabled ? categoryColors[allocation.category] : 'border-border bg-card'
                      )}
                      onClick={() => toggleCategory(allocation.category)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-11 h-11 rounded-xl flex items-center justify-center transition-colors',
                            allocation.enabled ? categoryIconBg[allocation.category] : 'bg-muted text-muted-foreground'
                          )}>
                            <Icon className="w-5 h-5" aria-hidden="true" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-foreground">{CATEGORY_LABELS[allocation.category]}</span>
                            {!isOneTime && (
                              <p className="text-smaller text-muted-foreground">Daily limit available</p>
                            )}
                            {isOneTime && (
                              <p className="text-smaller text-muted-foreground">One-time payment</p>
                            )}
                          </div>
                          <div className={cn(
                            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                            allocation.enabled ? 'bg-primary border-primary' : 'border-muted-foreground'
                          )}>
                            {allocation.enabled && <Check className="w-3.5 h-3.5 text-primary-foreground" aria-hidden="true" />}
                          </div>
                        </div>

                        {allocation.enabled && (
                          <div className="space-y-4 pt-4 mt-4 border-t border-border/50" onClick={e => e.stopPropagation()}>
                            {/* Amount with Slider */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-small text-muted-foreground">Amount</Label>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-foreground">${allocation.amount.toFixed(2)}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({Math.round((allocation.amount / Number(totalAmount)) * 100)}%)
                                  </span>
                                </div>
                              </div>
                              
                              {useSliders ? (
                                <Slider
                                  value={[allocation.amount]}
                                  onValueChange={([value]) => handleAllocationChange(allocation.category, 'amount', Number(value.toFixed(2)))}
                                  max={Number(totalAmount)}
                                  step={1}
                                  className="w-full"
                                  aria-label={`Allocate amount for ${CATEGORY_LABELS[allocation.category]}`}
                                />
                              ) : (
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-small text-muted-foreground">$</span>
                                  <Input
                                    type="number"
                                    inputMode="decimal"
                                    value={allocation.amount || ''}
                                    onChange={(e) => handleAllocationChange(allocation.category, 'amount', Number(e.target.value))}
                                    className="pl-7 h-11"
                                    placeholder="0"
                                    aria-label={`Amount for ${CATEGORY_LABELS[allocation.category]}`}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Daily Limit */}
                            {!isOneTime && (
                              <div className="flex items-center gap-3">
                                <Label className="w-24 text-small text-muted-foreground">Daily limit</Label>
                                <div className="relative flex-1">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-small text-muted-foreground">$</span>
                                  <Input
                                    type="number"
                                    inputMode="decimal"
                                    value={allocation.dailyLimit || ''}
                                    onChange={(e) => handleAllocationChange(allocation.category, 'dailyLimit', Number(e.target.value))}
                                    className="pl-7 h-11"
                                    placeholder="0"
                                    aria-label={`Daily limit for ${CATEGORY_LABELS[allocation.category]}`}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Review & Pay */}
          {step === 3 && (
            <div className={cn("space-y-6", stepAnimation)}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" aria-hidden="true" />
                </div>
                <h2 className="text-h2 text-foreground mb-2">Review & Pay</h2>
                <p className="text-small text-muted-foreground">Confirm details and pay via M-Pesa</p>
              </div>

              <Card className="card-elevated overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-border">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Recipient</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">+254 {phone}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => changeStep(0)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-b border-border bg-primary/5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Total Amount</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-semibold text-primary">${Number(totalAmount).toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => changeStep(1)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-muted-foreground text-small">Category Breakdown</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => changeStep(2)}
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {allocations.filter(a => a.enabled && a.amount > 0).map((a) => {
                        const Icon = categoryIcons[a.category];
                        return (
                          <div key={a.category} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', categoryIconBg[a.category])}>
                                <Icon className="w-4 h-4" aria-hidden="true" />
                              </div>
                              <span className="font-medium">{CATEGORY_LABELS[a.category]}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-foreground">${a.amount.toFixed(2)}</span>
                              {a.dailyLimit > 0 && (
                                <span className="text-smaller text-muted-foreground block">
                                  max ${a.dailyLimit}/day
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sender M-Pesa phone */}
              <div className="space-y-3">
                <Label htmlFor="senderPhone" className="text-small font-medium">Your M-Pesa Phone Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-4 bg-secondary rounded-xl border border-input">
                    <span className="text-muted-foreground font-medium">+254</span>
                  </div>
                  <div className="relative flex-1">
                    <Input
                      id="senderPhone"
                      type="tel"
                      name="senderPhone"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="712 345 678"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      className={cn(
                        "h-12 text-lg pr-10",
                        senderPhone.length > 0 && (isValidKenyanPhone(`0${senderPhone}`) ? 'border-success' : 'border-destructive')
                      )}
                    />
                    {senderPhone.length > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isValidKenyanPhone(`0${senderPhone}`) ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {senderPhone.length > 0 && !isValidKenyanPhone(`0${senderPhone}`) && (
                  <p className="text-smaller text-destructive flex items-center gap-1 mt-2">
                    <AlertCircle className="w-4 h-4" />
                    Please enter a valid 9-digit M-Pesa phone number
                  </p>
                )}
                {senderPhone.length > 0 && isValidKenyanPhone(`0${senderPhone}`) && (
                  <p className="text-smaller text-success flex items-center gap-1 mt-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Valid M-Pesa number
                  </p>
                )}
              </div>

              <div className="info-box">
                <p className="text-small text-center">
                  You'll receive an <strong>M-Pesa STK push</strong> on your phone.
                  Enter your PIN to complete the payment and fund the escrow.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border">
          <Button
            className="w-full h-14 text-base shadow-primary"
            disabled={!canProceed()}
            onClick={() => {
              if (step < 3) changeStep(step + 1);
              else handleConfirmAndPay();
            }}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : step < 3 ? (
              <>
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5 mr-2" />
                Confirm & Pay with M-Pesa
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Payment Confirmation Overlay */}
      {showOverlay && (
        <PaymentOverlay
          phase={paymentPhase}
          phoneNumber={senderPhone}
          amountKes={(Number(totalAmount) * 153.5).toLocaleString()}
          transactionCode={transactionCode}
          errorMessage={errorMessage}
          elapsedSeconds={elapsedSeconds}
          onRetry={handleRetry}
          onViewEscrow={() => {
            stopPolling();
            navigate(confirmedEscrowId ? `/sender/remittance/${confirmedEscrowId}` : '/sender');
          }}
          onDone={() => {
            stopPolling();
            navigate(confirmedEscrowId ? `/sender/remittance/${confirmedEscrowId}` : '/sender');
          }}
        />
      )}
    </AppLayout>
  );
}
