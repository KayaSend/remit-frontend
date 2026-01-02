import { useNavigate } from 'react-router-dom';
import { Send, Wallet, ArrowRight, Shield, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container px-4 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Remit</h1>
          <p className="text-primary-foreground/80 text-lg max-w-md mx-auto">
            Send money home with purpose. Your family spends it on what matters.
          </p>
        </div>
      </div>

      {/* Role Selection */}
      <div className="container px-4 -mt-6">
        <div className="grid gap-4 max-w-md mx-auto">
          {/* Sender Card */}
          <button
            onClick={() => handleRoleSelect('sender')}
            className="card-elevated p-6 text-left hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Send className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  I'm Sending Money
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h2>
                <p className="text-muted-foreground text-sm">
                  Send USD to family in Kenya. Control how it's spent on bills, school fees, and essentials.
                </p>
              </div>
            </div>
          </button>

          {/* Recipient Card */}
          <button
            onClick={() => handleRoleSelect('recipient')}
            className="card-elevated p-6 text-left hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <Wallet className="w-6 h-6 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  I'm Receiving Money
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h2>
                <p className="text-muted-foreground text-sm">
                  Request bill payments from funds sent by your loved ones abroad.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="container px-4 py-12">
        <div className="max-w-md mx-auto space-y-6">
          <h3 className="text-lg font-semibold text-center text-foreground mb-6">
            How it works
          </h3>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Send with purpose</h4>
              <p className="text-sm text-muted-foreground">
                Allocate funds to specific categories like electricity, rent, or school fees.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Set daily limits</h4>
              <p className="text-sm text-muted-foreground">
                Control spending with daily limits to ensure funds last.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Bills paid directly</h4>
              <p className="text-sm text-muted-foreground">
                We pay bills directly via M-Pesa. Recipients never handle cash.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
