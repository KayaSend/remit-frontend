import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Clock, Phone, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import {
  useSenderPaymentRequests,
  useApprovePaymentRequest,
  useRejectPaymentRequest,
} from '@/hooks/usePaymentRequests';
import { CATEGORY_LABELS, type Category } from '@/types/remittance';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const categoryColorMap: Record<string, string> = {
  electricity: 'bg-category-electricity',
  water: 'bg-category-water',
  rent: 'bg-category-rent',
  school: 'bg-category-school',
  food: 'bg-category-food',
};

function toCategory(name: string): Category {
  const map: Record<string, Category> = {
    electricity: 'electricity',
    water: 'water',
    rent: 'rent',
    school: 'school',
    'school fees': 'school',
    food: 'food',
    groceries: 'food',
  };
  return map[name.toLowerCase()] ?? 'food';
}

export default function PendingApprovals() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useSenderPaymentRequests('pending_approval');
  const approveRequest = useApprovePaymentRequest();
  const rejectRequest = useRejectPaymentRequest();

  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const pendingRequests = data?.data || [];

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      if (actionType === 'approve') {
        await approveRequest.mutateAsync(selectedRequest);
        toast.success('Payment approved successfully');
      } else {
        await rejectRequest.mutateAsync({ paymentRequestId: selectedRequest });
        toast.success('Payment rejected');
      }
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${actionType} payment`);
    } finally {
      setSelectedRequest(null);
      setActionType(null);
    }
  };

  const openConfirmDialog = (requestId: string, action: 'approve' | 'reject') => {
    setSelectedRequest(requestId);
    setActionType(action);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <p className="text-destructive mb-4">Failed to load pending requests</p>
          <Button onClick={() => navigate('/sender')}>Go Back</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/sender')}
            className="touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-h3 text-foreground">Pending Approvals</h1>
            <p className="text-smaller text-muted-foreground">
              {pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''} awaiting your approval
            </p>
          </div>
        </div>

        {/* Empty State */}
        {pendingRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">All caught up!</h2>
            <p className="text-muted-foreground mb-6">No pending payment requests to approve</p>
            <Button variant="outline" onClick={() => navigate('/sender')}>
              Back to Dashboard
            </Button>
          </div>
        )}

        {/* Pending Requests List */}
        <div className="space-y-4">
          {pendingRequests.map((request) => {
            const category = toCategory(request.categoryName);
            const isProcessing =
              (approveRequest.isPending || rejectRequest.isPending) &&
              selectedRequest === request.paymentRequestId;

            return (
              <Card
                key={request.paymentRequestId}
                className="card-elevated overflow-hidden animate-fade-in"
              >
                {/* Category color bar */}
                <div className={cn('h-1', categoryColorMap[category])} />

                <CardContent className="p-4">
                  {/* Header: Category + Amount */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center">
                        <CategoryIcon category={category} size={22} />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {CATEGORY_LABELS[category]}
                        </h3>
                        <p className="text-smaller text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">
                        KES {request.amountKes.toLocaleString()}
                      </p>
                      <p className="text-smaller text-muted-foreground">
                        ${request.amountUsd.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 p-3 bg-muted/50 rounded-lg">
                    {request.recipientPhone && (
                      <div className="flex items-center gap-2 text-small">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Recipient:</span>
                        <span className="font-medium">{request.recipientPhone}</span>
                      </div>
                    )}
                    {request.merchantName && (
                      <div className="flex items-center gap-2 text-small">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Pay to:</span>
                        <span className="font-medium">{request.merchantName}</span>
                      </div>
                    )}
                    {request.merchantAccount && (
                      <div className="flex items-center gap-2 text-small">
                        <span className="text-muted-foreground ml-6">Account:</span>
                        <span className="font-mono font-medium">{request.merchantAccount}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => openConfirmDialog(request.paymentRequestId, 'reject')}
                      disabled={isProcessing}
                    >
                      {isProcessing && actionType === 'reject' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </>
                      )}
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => openConfirmDialog(request.paymentRequestId, 'approve')}
                      disabled={isProcessing}
                    >
                      {isProcessing && actionType === 'approve' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedRequest && !!actionType} onOpenChange={() => {
        setSelectedRequest(null);
        setActionType(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Payment?' : 'Reject Payment?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve'
                ? 'This will release funds from the escrow to pay this bill. This action cannot be undone.'
                : 'This will reject the payment request. The recipient can submit a new request if needed.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={actionType === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
