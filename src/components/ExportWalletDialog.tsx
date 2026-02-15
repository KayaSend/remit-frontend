import { ShieldAlert } from 'lucide-react';
import { usePrivy, useCreateWallet } from '@privy-io/react-auth';
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

interface ExportWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportWalletDialog({ open, onOpenChange }: ExportWalletDialogProps) {
  const { user, exportWallet } = usePrivy();
  const { createWallet } = useCreateWallet();

  const handleExportWalletConfirmed = async () => {
    onOpenChange(false);
    try {
      const hasEmbeddedWallet = user?.linkedAccounts.some(
        (a) => a.type === 'wallet' && a.walletClientType === 'privy'
      );
      if (!hasEmbeddedWallet) {
        console.log('[ExportWallet] No embedded wallet found, creating one...');
        await createWallet();
      }
      await exportWallet();
    } catch (err) {
      console.error('[ExportWallet] Failed:', err);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="h-5 w-5 text-warning" />
            <AlertDialogTitle>Export Private Key</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2 text-left">
            <span className="block">Your private key gives <strong>full control</strong> over your wallet and funds. Keep it secret:</span>
            <span className="block">- Never share it with anyone</span>
            <span className="block">- Never paste it into websites or messages</span>
            <span className="block">- Anyone with this key can access your wallet</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleExportWalletConfirmed}>
            I Understand, Show Key
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
