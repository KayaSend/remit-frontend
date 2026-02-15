import { ArrowLeftRight, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePrivy } from '@privy-io/react-auth';
import { useRole } from '@/hooks/useRole';

export function Header() {
  const navigate = useNavigate();
  const { role, setRole, clearRole } = useRole();
  const { user, logout } = usePrivy();
  const email = user?.email?.address;

  if (!role) return null;

  const handleToggle = () => {
    const newRole = role === 'sender' ? 'recipient' : 'sender';
    setRole(newRole);
    navigate(newRole === 'sender' ? '/sender' : '/recipient');
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
  );
}
