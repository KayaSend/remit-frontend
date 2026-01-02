import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { CategoryBadge } from '@/components/ui/CategoryIcon';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useMockPaymentHistory } from '@/hooks/useMockData';
import { format } from 'date-fns';

export default function SenderHistory() {
  const navigate = useNavigate();
  const payments = useMockPaymentHistory();

  return (
    <AppLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/sender')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">All Transactions</h1>
        </div>

        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((payment) => (
              <Card key={payment.id} className="card-elevated animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <CategoryBadge category={payment.category} />
                    <StatusBadge status={payment.status} />
                  </div>
                  
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xl font-bold text-foreground">
                      ${payment.amountUSD.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      KES {payment.amountKES.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Acct: {payment.accountNumber}</span>
                    <span>{format(payment.createdAt, 'MMM d, h:mm a')}</span>
                  </div>

                  {payment.mpesaConfirmation && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">M-Pesa Ref: </span>
                      <span className="text-xs font-mono font-medium text-foreground">
                        {payment.mpesaConfirmation}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
