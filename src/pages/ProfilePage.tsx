import { useState } from 'react';
import { ArrowLeft, Copy, Check, KeyRound, Wallet, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePrivy, useCreateWallet } from '@privy-io/react-auth';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExportWalletDialog } from '@/components/ExportWalletDialog';
import { useRole } from '@/hooks/useRole';
import { useEscrowList } from '@/hooks/useEscrows';
import { useToast } from '@/components/ui/use-toast';
import { truncateAddress } from '@/lib/utils';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { role, clearRole, isSender } = useRole();
  const { data: escrows } = useEscrowList();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showExportWarning, setShowExportWarning] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);

  const email = user?.email?.address;
  const embeddedWallet = user?.linkedAccounts.find(
    (a) => a.type === 'wallet' && a.walletClientType === 'privy'
  );
  const walletAddress = embeddedWallet && 'address' in embeddedWallet ? embeddedWallet.address : undefined;

  const getInitial = () => {
    if (email) return email.charAt(0).toUpperCase();
    return role === 'sender' ? 'S' : 'R';
  };

  const handleCopyAddress = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast({ title: 'Copied', description: 'Wallet address copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateWallet = async () => {
    setCreatingWallet(true);
    try {
      await createWallet();
      toast({ title: 'Wallet created', description: 'Your embedded wallet is ready' });
    } catch (err) {
      console.error('[CreateWallet] Failed:', err);
    } finally {
      setCreatingWallet(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    clearRole();
    navigate('/');
  };

  const avatarStyle = {
    background: 'linear-gradient(135deg, hsl(var(--hue), var(--sat), var(--lig)) 0%, hsl(var(--hue), var(--sat), 35%) 100%)',
  };

  return (
    <AppLayout>
      <div className="container px-4 py-6 max-w-lg mx-auto">
        {/* Page header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="touch-target">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-h3 text-foreground">Profile</h1>
        </div>

        {/* Profile header card */}
        <Card className="summary-card mb-4">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-16 w-16 mb-3" style={avatarStyle}>
              <AvatarFallback className="text-white text-xl font-semibold bg-transparent">
                {getInitial()}
              </AvatarFallback>
            </Avatar>
            <p className="text-lg font-medium text-foreground">{email || 'No email'}</p>
            <Badge variant="secondary" className="mt-2 capitalize">
              {role}
            </Badge>
            {user?.createdAt && (
              <p className="text-small text-muted-foreground mt-2">
                Member since {format(new Date(user.createdAt), 'MMM yyyy')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Wallet card */}
        <Card className="card-elevated mb-4">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">Wallet</h2>
            </div>
            {walletAddress ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                  <code className="text-sm text-foreground">{truncateAddress(walletAddress, 6)}</code>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyAddress}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => setShowExportWarning(true)}
                >
                  <KeyRound className="h-4 w-4" />
                  Export Key
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">No wallet connected yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateWallet}
                  disabled={creatingWallet}
                  className="gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  {creatingWallet ? 'Creating...' : 'Create Wallet'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account stats card (sender only) */}
        {isSender && (
          <Card className="card-elevated mb-4">
            <CardContent className="p-5">
              <h2 className="text-sm font-medium text-foreground mb-3">Account</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-semibold text-foreground">{escrows?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Remittances</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-semibold text-foreground capitalize">{role}</p>
                  <p className="text-xs text-muted-foreground">Current Role</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator className="my-4" />

        {/* Sign out */}
        <Button
          variant="outline"
          className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <ExportWalletDialog open={showExportWarning} onOpenChange={setShowExportWarning} />
    </AppLayout>
  );
}
