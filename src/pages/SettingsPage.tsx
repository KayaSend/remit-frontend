import { useState } from 'react';
import { ArrowLeft, Sun, Moon, Monitor, Bell, KeyRound, ChevronRight, LogOut, Shield, Info, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExportWalletDialog } from '@/components/ExportWalletDialog';
import { useRole } from '@/hooks/useRole';

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { logout } = usePrivy();
  const { clearRole } = useRole();
  const [showExportWarning, setShowExportWarning] = useState(false);

  const handleLogout = async () => {
    await logout();
    clearRole();
    navigate('/');
  };

  return (
    <AppLayout>
      <div className="container px-4 py-6 max-w-lg mx-auto">
        {/* Page header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="touch-target">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-h3 text-foreground">Settings</h1>
        </div>

        {/* Appearance */}
        <Card className="card-elevated mb-4">
          <CardContent className="p-5">
            <h2 className="text-sm font-medium text-foreground mb-3">Appearance</h2>
            <div className="grid grid-cols-3 gap-3">
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                    theme === value
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="card-elevated mb-4">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-medium text-foreground">Notifications</h2>
              </div>
              <Badge variant="secondary" className="text-[10px]">Coming soon</Badge>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transaction Alerts</span>
                <Switch disabled />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment Confirmations</span>
                <Switch disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="card-elevated mb-4">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">Security</h2>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setShowExportWarning(true)}
                className="flex items-center justify-between w-full p-3 -mx-1 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Export Wallet Key</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex items-center justify-between p-3 -mx-1 rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Change Password</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">Coming soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="card-elevated mb-4">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">About</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">App Version</span>
                <span className="text-foreground font-mono">v0.1.0</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Terms & Privacy</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Help & Support</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="card-elevated border-destructive/20 mb-4">
          <CardContent className="p-5">
            <h2 className="text-sm font-medium text-destructive mb-3">Danger Zone</h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 opacity-50"
                disabled
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
                <Badge variant="secondary" className="text-[10px] ml-auto">Coming soon</Badge>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ExportWalletDialog open={showExportWarning} onOpenChange={setShowExportWarning} />
    </AppLayout>
  );
}
