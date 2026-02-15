import { useState, useCallback } from 'react';
import { usePrivy, useCreateWallet } from '@privy-io/react-auth';
import { apiPost } from '@/services/api';

type WalletSetupStatus = 'idle' | 'creating' | 'syncing' | 'done' | 'error';

export function useWalletSetup() {
  const { user } = usePrivy();
  const { createWallet } = useCreateWallet();
  const [status, setStatus] = useState<WalletSetupStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const syncToBackend = useCallback(async (address: string, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await apiPost('/wallets/sync', {
          walletAddress: address,
          chainType: 'evm',
        });
        return;
      } catch (err) {
        if (attempt === retries) {
          console.warn('[WalletSetup] Backend sync failed after retries:', err);
          throw err;
        }
        // Backoff: 1s, 2s
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }, []);

  const setupWallet = useCallback(async () => {
    if (!user) return;

    try {
      // Check if user already has a Privy embedded wallet
      const existingWallet = user.linkedAccounts.find(
        (account) =>
          account.type === 'wallet' &&
          account.walletClientType === 'privy'
      );

      let walletAddress: string;

      if (existingWallet && 'address' in existingWallet) {
        walletAddress = existingWallet.address;
        console.log('[WalletSetup] Existing embedded wallet found:', walletAddress);
      } else {
        setStatus('creating');
        console.log('[WalletSetup] Creating embedded wallet...');
        const wallet = await createWallet();
        walletAddress = wallet.address;
        console.log('[WalletSetup] Embedded wallet created:', walletAddress);
      }

      // Sync to backend
      setStatus('syncing');
      await syncToBackend(walletAddress);
      setStatus('done');
      console.log('[WalletSetup] Wallet synced to backend');
    } catch (err) {
      setStatus('error');
      const message = err instanceof Error ? err.message : 'Wallet setup failed';
      setError(message);
      console.error('[WalletSetup] Error:', message);
      // Never throw — wallet setup failure should not block the user
    }
  }, [user, createWallet, syncToBackend]);

  return { status, error, setupWallet };
}
