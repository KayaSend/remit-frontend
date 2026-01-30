import { ReactNode } from 'react';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={hideNav ? '' : 'pb-24'}>
        {children}
      </main>
      {!hideNav && <MobileNav />}
    </div>
  );
}
