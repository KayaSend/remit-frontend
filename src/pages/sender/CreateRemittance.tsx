import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Phone, DollarSign, Zap, Droplets, Home, GraduationCap, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, type Category } from '@/types/remittance';

const steps = ['Recipient', 'Amount', 'Allocate', 'Review'];

const categoryIcons: Record<Category, typeof Zap> = {
  electricity: Zap,
  water: Droplets,
  rent: Home,
  school: GraduationCap,
  food: ShoppingCart,
};

const categoryColors: Record<Category, string> = {
  electricity: 'bg-category-electricity/10 text-category-electricity border-category-electricity/30',
  water: 'bg-category-water/10 text-category-water border-category-water/30',
  rent: 'bg-category-rent/10 text-category-rent border-category-rent/30',
  school: 'bg-category-school/10 text-category-school border-category-school/30',
  food: 'bg-category-food/10 text-category-food border-category-food/30',
};

interface Allocation {
  category: Category;
  amount: number;
  dailyLimit: number;
  enabled: boolean;
}

export default function CreateRemittance() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [allocations, setAllocations] = useState<Allocation[]>([
    { category: 'electricity', amount: 0, dailyLimit: 15, enabled: false },
    { category: 'water', amount: 0, dailyLimit: 10, enabled: false },
    { category: 'rent', amount: 0, dailyLimit: 0, enabled: false },
    { category: 'school', amount: 0, dailyLimit: 0, enabled: false },
    { category: 'food', amount: 0, dailyLimit: 20, enabled: false },
  ]);

  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
  const remaining = Number(totalAmount) - totalAllocated;

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

  const canProceed = () => {
    switch (step) {
      case 0: return phone.length >= 10;
      case 1: return Number(totalAmount) >= 10;
      case 2: return totalAllocated > 0 && remaining >= 0;
      case 3: return true;
      default: return false;
    }
  };

  const handleSubmit = () => {
    // Mock submission
    navigate('/sender');
  };

  return (
    <AppLayout>
      <div className="container px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/sender')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Send Money</h1>
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
          {/* Step 1: Recipient */}
          {step === 0 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-accent-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Who are you sending to?</h2>
                <p className="text-sm text-muted-foreground">Enter their Kenya phone number</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-muted rounded-lg border border-input">
                    <span className="text-muted-foreground">+254</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="712 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Amount */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">How much are you sending?</h2>
                <p className="text-sm text-muted-foreground">Enter amount in USD</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="pl-8 text-2xl h-14"
                  />
                </div>
                {Number(totalAmount) > 0 && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    ≈ KES {(Number(totalAmount) * 153.5).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Allocate */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-foreground">Allocate to categories</h2>
                <p className="text-sm text-muted-foreground">
                  ${remaining.toFixed(2)} of ${totalAmount} unallocated
                </p>
              </div>

              <div className="space-y-3">
                {allocations.map((allocation) => {
                  const Icon = categoryIcons[allocation.category];
                  const isRentOrSchool = allocation.category === 'rent' || allocation.category === 'school';
                  
                  return (
                    <Card 
                      key={allocation.category}
                      className={cn(
                        'border-2 transition-colors cursor-pointer',
                        allocation.enabled ? categoryColors[allocation.category] : 'border-transparent'
                      )}
                      onClick={() => toggleCategory(allocation.category)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            allocation.enabled ? 'bg-current/10' : 'bg-muted'
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">{CATEGORY_LABELS[allocation.category]}</span>
                            {!isRentOrSchool && (
                              <p className="text-xs text-muted-foreground">Daily limit available</p>
                            )}
                          </div>
                          <div className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                            allocation.enabled ? 'bg-current border-current' : 'border-muted-foreground'
                          )}>
                            {allocation.enabled && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>

                        {allocation.enabled && (
                          <div className="space-y-3 pt-3 border-t border-border/50" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-3">
                              <Label className="w-20 text-sm">Amount</Label>
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                                <Input
                                  type="number"
                                  value={allocation.amount || ''}
                                  onChange={(e) => handleAllocationChange(allocation.category, 'amount', Number(e.target.value))}
                                  className="pl-7 h-10"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            {!isRentOrSchool && (
                              <div className="flex items-center gap-3">
                                <Label className="w-20 text-sm">Daily limit</Label>
                                <div className="relative flex-1">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                                  <Input
                                    type="number"
                                    value={allocation.dailyLimit || ''}
                                    onChange={(e) => handleAllocationChange(allocation.category, 'dailyLimit', Number(e.target.value))}
                                    className="pl-7 h-10"
                                    placeholder="0"
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

          {/* Step 4: Review */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Review & Confirm</h2>
              </div>

              <Card className="card-elevated">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Recipient</span>
                    <span className="font-medium">+254 {phone}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-medium">${Number(totalAmount).toFixed(2)}</span>
                  </div>
                  
                  <div className="py-2">
                    <span className="text-muted-foreground block mb-3">Allocations</span>
                    {allocations.filter(a => a.enabled && a.amount > 0).map((a) => {
                      const Icon = categoryIcons[a.category];
                      return (
                        <div key={a.category} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span>{CATEGORY_LABELS[a.category]}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">${a.amount.toFixed(2)}</span>
                            {a.dailyLimit > 0 && (
                              <span className="text-xs text-muted-foreground block">
                                ${a.dailyLimit}/day
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border">
          <Button 
            className="w-full h-12 text-base"
            disabled={!canProceed()}
            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
          >
            {step < 3 ? (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              'Confirm & Send'
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
