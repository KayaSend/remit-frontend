import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { useMockRecipientBalances } from '@/hooks/useMockData';
import { CATEGORY_LABELS, USD_TO_KES, type Category } from '@/types/remittance';
import { cn } from '@/lib/utils';

const accountLabels: Record<Category, string> = {
  electricity: 'Meter Number',
  water: 'Account Number',
  rent: 'Landlord Reference',
  school: 'Student ID / Ref',
  food: 'Store Account',
};

const accountPlaceholders: Record<Category, string> = {
  electricity: 'e.g., 12345678901',
  water: 'e.g., 987654321',
  rent: 'e.g., APT-123',
  school: 'e.g., STU-2024-001',
  food: 'e.g., NAIVAS-001',
};

export default function RequestPayment() {
  const navigate = useNavigate();
  const balances = useMockRecipientBalances();
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBalance = balances.find(b => b.category === selectedCategory);
  const amountNum = Number(amount);
  const dailyRemaining = selectedBalance?.dailyLimitKES 
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

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      navigate('/recipient/payment-status', { 
        state: { 
          category: selectedCategory,
          amountKES: amountNum,
          accountNumber 
        } 
      });
    }, 1500);
  };

  const steps = ['Category', 'Amount', 'Account', 'Confirm'];

  return (
    <AppLayout>
      <div className="container px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/recipient')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Request Payment</h1>
            <p className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
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
                <h2 className="text-lg font-semibold text-foreground">What bill do you want to pay?</h2>
                <p className="text-sm text-muted-foreground">Select a category</p>
              </div>

              <div className="grid gap-3">
                {balances.filter(b => b.isActive).map((balance) => (
                  <Card
                    key={balance.category}
                    className={cn(
                      'cursor-pointer transition-all',
                      selectedCategory === balance.category
                        ? 'ring-2 ring-primary bg-accent'
                        : 'hover:bg-muted/50'
                    )}
                    onClick={() => setSelectedCategory(balance.category)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                            <CategoryIcon category={balance.category} size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {CATEGORY_LABELS[balance.category]}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              KES {balance.availableKES.toLocaleString()} available
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          selectedCategory === balance.category 
                            ? 'bg-primary border-primary' 
                            : 'border-muted-foreground'
                        )}>
                          {selectedCategory === balance.category && (
                            <Check className="w-3 h-3 text-primary-foreground" />
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
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                  <CategoryIcon category={selectedCategory!} size={24} />
                </div>
                <h2 className="text-lg font-semibold text-foreground">How much?</h2>
                <p className="text-sm text-muted-foreground">
                  Available: KES {selectedBalance.availableKES.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KES)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">KES</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-14 text-2xl h-14"
                  />
                </div>

                {amountNum > 0 && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    ≈ ${(amountNum / USD_TO_KES).toFixed(2)} USD
                  </p>
                )}

                {dailyRemaining !== null && (
                  <div className={cn(
                    'flex items-center gap-2 mt-4 p-3 rounded-lg',
                    exceedsDaily ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                  )}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">
                      Daily limit: KES {dailyRemaining.toLocaleString()} remaining today
                    </span>
                  </div>
                )}

                {exceedsTotal && (
                  <div className="flex items-center gap-2 mt-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">Amount exceeds available balance</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Account Number */}
          {step === 2 && selectedCategory && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Enter {accountLabels[selectedCategory]}
                </h2>
                <p className="text-sm text-muted-foreground">
                  We'll pay this bill directly
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">{accountLabels[selectedCategory]}</Label>
                <Input
                  id="account"
                  type="text"
                  placeholder={accountPlaceholders[selectedCategory]}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 3 && selectedCategory && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Confirm Payment Request</h2>
              </div>

              <Card className="card-elevated">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium flex items-center gap-2">
                      <CategoryIcon category={selectedCategory} size={16} />
                      {CATEGORY_LABELS[selectedCategory]}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">KES {amountNum.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">{accountLabels[selectedCategory]}</span>
                    <span className="font-medium">{accountNumber}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-accent/50 rounded-xl p-4">
                <p className="text-sm text-accent-foreground text-center">
                  <strong>We will pay this bill for you.</strong><br />
                  The payment will be sent directly to the provider via M-Pesa.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border">
          <Button 
            className="w-full h-12 text-base"
            disabled={!canProceed() || isSubmitting}
            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : step < 3 ? (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
