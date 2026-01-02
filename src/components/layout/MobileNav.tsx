import { Home, PlusCircle, History, Settings } from 'lucide-react';
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/sender' && item.path !== '/recipient' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors touch-target',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
