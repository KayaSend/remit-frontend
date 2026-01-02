import { ArrowLeftRight, Send, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRole } from '@/hooks/useRole';

export function Header() {
  const navigate = useNavigate();
  const { role, setRole } = useRole();

  if (!role) return null;

  const handleToggle = () => {
    const newRole = role === 'sender' ? 'recipient' : 'sender';
    setRole(newRole);
    navigate(newRole === 'sender' ? '/sender' : '/recipient');
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            {role === 'sender' ? (
              <Send className="w-5 h-5 text-primary-foreground" />
            ) : (
              <Wallet className="w-5 h-5 text-primary-foreground" />
            )}
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Remit</h1>
            <p className="text-xs text-muted-foreground capitalize">
              {role === 'sender' ? 'Sending Money' : 'Receiving Money'}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          className="gap-2"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span className="hidden sm:inline">Switch to {role === 'sender' ? 'Recipient' : 'Sender'}</span>
          <span className="sm:hidden">Switch</span>
        </Button>
      </div>
    </header>
  );
}
