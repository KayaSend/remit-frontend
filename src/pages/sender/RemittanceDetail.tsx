import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryProgress } from '@/components/ui/CategoryProgress';
import { CategoryBadge } from '@/components/ui/CategoryIcon';
import { useEscrowList } from '@/hooks/useEscrows';
import { usePaymentRequestList } from '@/hooks/usePaymentRequests';
import { format } from 'date-fns';

export default function RemittanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: remittances } = useEscrowList();
  const { data: paymentHistory } = usePaymentRequestList();

  const remittance = remittances.find(r => r.id === id);

  if (!remittance) {
    return (
      <AppLayout>
        <div className="container px-4 py-6 text-center">
          <p className="text-muted-foreground">Remittance not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/sender')}>
            Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/sender')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Remittance Details</h1>
          </div>
          <StatusBadge status={remittance.status} />
        </div>

        {/* Recipient Info */}
        <Card className="card-elevated mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <User className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {remittance.recipientName || 'Recipient'}
                </p>
                <p className="text-sm text-muted-foreground">{remittance.recipientPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Summary */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-6 mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold">${remittance.remainingBalance.toFixed(2)}</span>
            <span className="text-primary-foreground/70">remaining</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-primary-foreground/80">
            <span>Sent: ${remittance.totalAmount.toFixed(2)}</span>
            <span>•</span>
            <span>Spent: ${(remittance.totalAmount - remittance.remainingBalance).toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-primary-foreground/20">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Expires {format(remittance.expiresAt, 'MMM d, yyyy')}</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <Card className="card-elevated mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {remittance.allocations.map((allocation) => (
              <CategoryProgress
                key={allocation.category}
                category={allocation.category}
                allocated={allocation.allocated}
                spent={allocation.spent}
                dailyLimit={allocation.dailyLimit}
                showDetails
              />
            ))}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentHistory.length > 0 ? (
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <div 
                    key={payment.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <CategoryBadge category={payment.category} />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          KES {payment.amountKES.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(payment.createdAt, 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={payment.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No payments yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
