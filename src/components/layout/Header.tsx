import { useState } from 'react';
import { ArrowLeftRight, LogOut, User, Settings, KeyRound, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePrivy, useCreateWallet } from '@privy-io/react-auth';
import { useRole } from '@/hooks/useRole';

export function Header() {
  const navigate = useNavigate();
  const { role, setRole, clearRole } = useRole();
  const { user, logout, exportWallet } = usePrivy();
  const { createWallet } = useCreateWallet();
  const email = user?.email?.address;
  const [showExportWarning, setShowExportWarning] = useState(false);

  if (!role) return null;

  const handleToggle = () => {
    const newRole = role === 'sender' ? 'recipient' : 'sender';
    setRole(newRole);
    navigate(newRole === 'sender' ? '/sender' : '/recipient');
  };

  const handleExportWalletConfirmed = async () => {
    setShowExportWarning(false);
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

  const handleLogout = async () => {
    await logout();
    clearRole();
    navigate('/');
  };

  // Get initials from email, fall back to role initial
  const getInitials = () => {
    if (email) return email.charAt(0).toUpperCase();
    return role === 'sender' ? 'S' : 'R';
  };

  const avatarStyle = {
    background: 'linear-gradient(135deg, hsl(var(--hue), var(--sat), var(--lig)) 0%, hsl(var(--hue), var(--sat), 35%) 100%)',
  };

  return (
    <>
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border transition-colors duration-300">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-semibold text-foreground">KayaSend</h1>
            <p className="text-smaller text-muted-foreground capitalize">
              {role === 'sender' ? 'Sending Money' : 'Receiving Money'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            className="gap-2 touch-target hidden sm:flex"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Switch to {role === 'sender' ? 'Recipient' : 'Sender'}</span>
          </Button>

          {/* Profile Avatar with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-primary/50 transition-all duration-300"
              >
                <Avatar className="h-10 w-10 transition-transform duration-300 hover:scale-105" style={avatarStyle}>
                  <AvatarImage src="" alt="Profile" />
                  <AvatarFallback className="text-white font-semibold bg-transparent">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 glass border border-border/50" 
              align="end" 
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {role === 'sender' ? 'Sender Account' : 'Recipient Account'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {email || (role === 'sender' ? 'Managing remittances' : 'Receiving payments')}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => {}}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => {}}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setShowExportWarning(true)}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                <span>Export Wallet Key</span>
              </DropdownMenuItem>

              {/* Mobile-only: Switch Role */}
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-accent transition-colors sm:hidden"
                onClick={handleToggle}
              >
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                <span>Switch to {role === 'sender' ? 'Recipient' : 'Sender'}</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

    <AlertDialog open={showExportWarning} onOpenChange={setShowExportWarning}>
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
    </>
  );
}
