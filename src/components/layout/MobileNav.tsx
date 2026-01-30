import { Home, PlusCircle, History } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';

const senderNav = [
  { icon: Home, label: 'Dashboard', path: '/sender' },
  { icon: PlusCircle, label: 'Send', path: '/sender/create' },
  { icon: History, label: 'History', path: '/sender/history' },
];

const recipientNav = [
  { icon: Home, label: 'Home', path: '/recipient' },
  { icon: PlusCircle, label: 'Request', path: '/recipient/request' },
  { icon: History, label: 'History', path: '/recipient/history' },
];

export function MobileNav() {
  const location = useLocation();
  const { role } = useRole();

  if (!role) return null;

  const navItems = role === 'sender' ? senderNav : recipientNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border pb-safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/sender' && item.path !== '/recipient' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-xl transition-all touch-target',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'drop-shadow-sm')} />
              <span className="text-smaller font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
