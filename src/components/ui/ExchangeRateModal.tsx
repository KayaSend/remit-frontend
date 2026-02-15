import { ArrowRight, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ExchangeRateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  amountKES: number;
  amountUSD: number;
  exchangeRate: number;
  isLoading?: boolean;
}

export function ExchangeRateModal({
  open,
  onOpenChange,
  onConfirm,
  amountKES,
  amountUSD,
  exchangeRate,
  isLoading = false,
}: ExchangeRateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Exchange Rate</DialogTitle>
          <DialogDescription>
            Review the conversion details before submitting your payment request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Exchange Rate Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
                <Info className="w-4 h-4" />
                <span>Current Exchange Rate</span>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  1 USD = {exchangeRate.toFixed(2)} KES
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Amount Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm text-muted-foreground">KES Amount</span>
              <span className="text-lg font-semibold text-foreground">
                KES {amountKES.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm text-muted-foreground">USD Equivalent</span>
              <span className="text-lg font-semibold text-foreground">
                ${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-accent/50 rounded-lg p-3">
            <p className="text-xs text-center text-muted-foreground">
              Exchange rates are subject to market conditions. The sender will be charged the USD equivalent amount.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={onConfirm} 
            disabled={isLoading}
            className="shadow-primary"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              'Confirm & Submit'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
