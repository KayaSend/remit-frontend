import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { useRecipientBalances } from '@/hooks/useRecipients';
import { useCreatePaymentRequest } from '@/hooks/usePaymentRequests';
import { CATEGORY_LABELS, USD_TO_KES, type Category } from '@/types/remittance';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const accountLabels: Record<Category, string> = {
  electricity: 'Meter Number',
  water: 'Account Number',
  rent: 'Landlord M-Pesa',
  school: 'Student ID / Ref',
  food: 'Store Account',
};

const accountPlaceholders: Record<Category, string> = {
  electricity: 'e.g., 12345678901',
  water: 'e.g., 987654321',
  rent: 'e.g., 0712345678',
  school: 'e.g., STU-2024-001',
  food: 'e.g., NAIVAS-001',
};

const categoryColorMap: Record<Category, string> = {
  electricity: 'bg-category-electricity',
  water: 'bg-category-water',
  rent: 'bg-category-rent',
  school: 'bg-category-school',
  food: 'bg-category-food',
};

export default function RequestPayment() {
  const navigate = useNavigate();
  const { data: balances } = useRecipientBalances();
  const createPaymentRequest = useCreatePaymentRequest();
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [merchantName, setMerchantName] = useState('');

  const selectedBalance = balances.find(b => b.category === selectedCategory);
  const amountNum = Number(amount);
  
  // One-time payment categories bypass daily limits
  const isOneTimePayment = selectedCategory === 'rent' || selectedCategory === 'school';
  
  const dailyRemaining = selectedBalance?.dailyLimitKES && !isOneTimePayment
    ? selectedBalance.dailyLimitKES - selectedBalance.dailySpentKES 
    : null;
  
  const exceedsDaily = dailyRemaining !== null && amountNum > dailyRemaining;
  const exceedsTotal = selectedBalance && amountNum > selectedBalance.availableKES;

  const canProceed = () => {
    switch (step) {
      case 0: return selectedCategory !== null;
      case 1: return amountNum > 0 && !exceedsDaily && !exceedsTotal;
      case 2: return accountNumber.length >= 3;
      case 3: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!selectedBalance || !selectedCategory) return;

    const amountKesCents = Math.round(amountNum * 100);
    const amountUsdCents = Math.round((amountNum / USD_TO_KES) * 100);

    try {
      const result = await createPaymentRequest.mutateAsync({
        escrowId: selectedBalance.escrowId,
        categoryId: selectedBalance.categoryId,
        categoryName: CATEGORY_LABELS[selectedCategory],
        amountKesCents,
        amountUsdCents,
        exchangeRate: USD_TO_KES,
        merchantName: merchantName || CATEGORY_LABELS[selectedCategory],
        merchantAccount: accountNumber,
      });

      toast.success('Payment request submitted');
      navigate('/recipient/payment-status', {
        state: {
          paymentRequestId: result.paymentRequestId,
          category: selectedCategory,
          amountKES: amountNum,
          accountNumber,
        },
      });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit payment request');
    }
  };

  const steps = ['Category', 'Amount', 'Account', 'Confirm'];

  return (
    <AppLayout hideNav>
      <div className="container px-4 py-6 pb-32">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/recipient')}
            className="touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-h3 text-foreground">Request Payment</h1>
            <p className="text-smaller text-muted-foreground">Step {step + 1} of {steps.length}: {steps[step]}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                i <= step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Select Category */}
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-h2 text-foreground mb-2">What bill do you want to pay?</h2>
                <p className="text-small text-muted-foreground">Select a category below</p>
              </div>

              <div className="grid gap-3">
                {balances.filter(b => b.isActive).map((balance) => (
                  <Card
                    key={balance.category}
                    className={cn(
                      'cursor-pointer transition-all duration-300 overflow-hidden',
                      selectedCategory === balance.category
                        ? 'ring-2 ring-primary bg-accent border-primary'
                        : 'hover:bg-muted/50'
                    )}
                    onClick={() => setSelectedCategory(balance.category)}
                  >
                    {/* Category color bar */}
                    <div className={cn('h-1', categoryColorMap[balance.category])} />
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center">
                            <CategoryIcon category={balance.category} size={22} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {CATEGORY_LABELS[balance.category]}
                            </p>
                            <p className="text-smaller text-muted-foreground">
                              KES {balance.availableKES.toLocaleString()} available
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                          selectedCategory === balance.category 
                            ? 'bg-primary border-primary' 
                            : 'border-muted-foreground'
                        )}>
                          {selectedCategory === balance.category && (
                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Enter Amount */}
          {step === 1 && selectedBalance && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                  <CategoryIcon category={selectedCategory!} size={28} />
                </div>
                <h2 className="text-h2 text-foreground mb-2">How much?</h2>
                <p className="text-small text-muted-foreground">
                  Available: <strong>KES {selectedBalance.availableKES.toLocaleString()}</strong>
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="amount" className="text-small font-medium">Amount (KES)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground font-medium">KES</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-16 text-3xl h-16 font-semibold"
                  />
                </div>

                {amountNum > 0 && !exceedsDaily && !exceedsTotal && (
                  <div className="bg-accent/50 rounded-xl p-4 mt-4">
                    <p className="text-small text-accent-foreground text-center">
                      ≈ <strong>${(amountNum / USD_TO_KES).toFixed(2)} USD</strong>
                    </p>
                  </div>
                )}

                {dailyRemaining !== null && !isOneTimePayment && (
                  <div className={cn(
                    'flex items-start gap-3 mt-4 p-4 rounded-xl',
                    exceedsDaily ? 'bg-destructive/10' : 'bg-muted'
                  )}>
                    <AlertCircle className={cn(
                      'w-5 h-5 flex-shrink-0 mt-0.5',
                      exceedsDaily ? 'text-destructive' : 'text-muted-foreground'
                    )} />
                    <div>
                      <p className={cn(
                        'text-small font-medium',
                        exceedsDaily ? 'text-destructive' : 'text-foreground'
                      )}>
                        Daily limit: KES {dailyRemaining.toLocaleString()} remaining
                      </p>
                      <p className="text-smaller text-muted-foreground mt-0.5">
                        Your sender set this limit for this category
                      </p>
                    </div>
                  </div>
                )}

                {isOneTimePayment && amountNum > 0 && !exceedsTotal && (
                  <div className="flex items-start gap-3 mt-4 p-4 rounded-xl bg-primary/10">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
                    <div>
                      <p className="text-small font-medium text-primary">
                        One-time payment - No daily limit
                      </p>
                      <p className="text-smaller text-muted-foreground mt-0.5">
                        You can request the full amount at once
                      </p>
                    </div>
                  </div>
                )}

                {exceedsTotal && (
                  <div className="flex items-start gap-3 mt-2 p-4 rounded-xl bg-destructive/10">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-destructive" />
                    <p className="text-small text-destructive font-medium">
                      Amount exceeds available balance
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Account Number */}
          {step === 2 && selectedCategory && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-h2 text-foreground mb-2">
                  Enter {accountLabels[selectedCategory]}
                </h2>
                <p className="text-small text-muted-foreground">
                  We'll pay this bill directly via M-Pesa
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="account" className="text-small font-medium">
                  {accountLabels[selectedCategory]}
                </Label>
                <Input
                  id="account"
                  type="text"
                  placeholder={accountPlaceholders[selectedCategory]}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="h-14 text-lg"
                />
              </div>

              <div className="info-box mt-6">
                <p className="text-small text-center">
                  Double-check the account number. We'll verify it before sending payment.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 3 && selectedCategory && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-h2 text-foreground mb-2">Confirm Payment Request</h2>
              </div>

              <Card className="card-elevated overflow-hidden">
                <div className={cn('h-1.5', categoryColorMap[selectedCategory])} />
                <CardContent className="p-0">
                  <div className="p-4 border-b border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium flex items-center gap-2">
                        <CategoryIcon category={selectedCategory} size={18} />
                        {CATEGORY_LABELS[selectedCategory]}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 border-b border-border bg-primary/5">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="text-xl font-semibold text-primary">KES {amountNum.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{accountLabels[selectedCategory]}</span>
                      <span className="font-medium font-mono">{accountNumber}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
                <p className="text-foreground font-medium mb-1">
                  We will pay this bill for you
                </p>
                <p className="text-small text-muted-foreground">
                  The payment will be sent directly to the provider via M-Pesa. You will receive confirmation.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border">
          <Button 
            className="w-full h-14 text-base shadow-primary"
            disabled={!canProceed() || createPaymentRequest.isPending}
            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
          >
            {createPaymentRequest.isPending ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : step < 3 ? (
              <>
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
