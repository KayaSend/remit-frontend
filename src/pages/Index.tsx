import { useNavigate } from 'react-router-dom';
import { Send, Wallet, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { role, setRole, isLoading } = useRole();

  useEffect(() => {
    if (!isLoading && role) {
      navigate(role === 'sender' ? '/sender' : '/recipient');
    }
  }, [role, isLoading, navigate]);

  const handleRoleSelect = (selectedRole: 'sender' | 'recipient') => {
    setRole(selectedRole);
    navigate(selectedRole === 'sender' ? '/sender' : '/recipient');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with trust-focused design */}
      <div className="summary-card mx-4 mt-6 mb-8">
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mb-5">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Remit</h1>
          <p className="text-primary-foreground/80 text-small max-w-xs">
            Send money home. Pay bills directly. 
            Your family never handles cash.
          </p>
        </div>
      </div>

      {/* Role Selection - Clear and simple */}
      <div className="container px-4">
        <p className="text-center text-muted-foreground text-small mb-4">
          How are you using Remit today?
        </p>
        
        <div className="grid gap-4 max-w-md mx-auto">
          {/* Sender Card */}
          <button
            onClick={() => handleRoleSelect('sender')}
            className="card-elevated p-5 text-left group transition-all duration-300 touch-target"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Send className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-h3 text-foreground mb-1 flex items-center gap-2">
                  I'm Sending Money
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h2>
                <p className="text-muted-foreground text-small leading-relaxed">
                  Pay bills for family in Kenya. You choose what the money is used for.
                </p>
              </div>
            </div>
          </button>

          {/* Recipient Card */}
          <button
            onClick={() => handleRoleSelect('recipient')}
            className="card-elevated p-5 text-left group transition-all duration-300 touch-target"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <Wallet className="w-6 h-6 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-h3 text-foreground mb-1 flex items-center gap-2">
                  I'm Receiving Money
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h2>
                <p className="text-muted-foreground text-small leading-relaxed">
                  Request bill payments. We send money directly to pay your bills.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* How it works - Plain language */}
      <div className="container px-4 py-10">
        <div className="max-w-md mx-auto">
          <h3 className="text-h3 text-center text-foreground mb-6">
            How it works
          </h3>
          
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-small font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-0.5">Sender picks the bills</h4>
                <p className="text-small text-muted-foreground">
                  Choose electricity, water, rent, school, or food.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-small font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-0.5">Recipient requests payment</h4>
                <p className="text-small text-muted-foreground">
                  Enter the bill details. We verify the account.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-small font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-0.5">We pay the bill via M-Pesa</h4>
                <p className="text-small text-muted-foreground">
                  Money goes directly to the provider. Fast and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="container px-4 pb-8">
        <div className="max-w-md mx-auto">
          <div className="info-box">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-small text-foreground">
                <strong>No cash changes hands.</strong> Bills are paid directly to verified providers in Kenya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
