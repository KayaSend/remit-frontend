# Quick Start Implementation Guide

**For rapid integration of Privy + Google OAuth in your React/TypeScript fintech app**

---

## File Structure to Create

```
src/
├── integrations/
│   ├── supabase.ts          (Supabase client + sync functions)
│   └── privy.ts             (Privy setup helpers)
├── pages/
│   ├── LoginPage.tsx        (Login with Privy OAuth)
│   └── OnboardingPage.tsx   (Role selection)
├── components/
│   ├── LoginButton.tsx      (Login button with Google OAuth)
│   ├── LogoutButton.tsx     (Logout button)
│   ├── ProtectedRoute.tsx   (Auth-protected wrapper)
│   └── AuthError.tsx        (Error display)
├── hooks/
│   ├── useUserRole.ts       (Get user's sender/recipient role)
│   └── useUserPreferences.ts (Manage user settings)
├── types/
│   ├── user.ts              (User type definitions)
│   └── errors.ts            (Error types)
└── utils/
    ├── error-messages.ts    (Error message mapping)
    └── auth-helpers.ts      (Auth utility functions)
```

---

## 1. Install Dependencies

```bash
npm install @privy-io/react-auth @supabase/supabase-js sonner
```

---

## 2. Environment Setup

```bash
# .env.local
VITE_PRIVY_APP_ID=your_privy_app_id_here
VITE_PRIVY_CLIENT_ID=your_privy_client_id_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

---

## 3. Update src/main.tsx

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { PrivyProvider } from '@privy-io/react-auth';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      clientId={import.meta.env.VITE_PRIVY_CLIENT_ID}
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
        }
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
```

---

## 4. Create Core Components

### src/components/LoginButton.tsx

```typescript
import { useLoginWithOAuth } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { syncPrivyUserToSupabase } from '@/integrations/supabase';

export function LoginButton() {
  const navigate = useNavigate();
  const { state, initOAuth } = useLoginWithOAuth({
    onComplete: async ({ user, isNewUser }) => {
      try {
        // Sync user to Supabase
        await syncPrivyUserToSupabase(user);

        // Redirect based on new/existing
        if (isNewUser) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        toast.error('Failed to save user data');
        console.error('Sync error:', error);
      }
    },
    onError: (error) => {
      toast.error('Login failed. Please try again.');
      console.error('OAuth error:', error);
    }
  });

  return (
    <button
      onClick={() => initOAuth({ provider: 'google' })}
      disabled={state.status === 'loading'}
      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {state.status === 'loading' ? 'Logging in...' : 'Login with Google'}
    </button>
  );
}
```

### src/components/ProtectedRoute.tsx

```typescript
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { ready, authenticated } = usePrivy();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !authenticated) {
      navigate('/login');
    }
  }, [ready, authenticated, navigate]);

  if (!ready) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
```

### src/components/LogoutButton.tsx

```typescript
import { useLogout } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';

export function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useLogout({
    onSuccess: () => {
      navigate('/login');
    },
    onError: (error) => {
      console.error('Logout error:', error);
    }
  });

  return (
    <button
      onClick={logout}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
    >
      Logout
    </button>
  );
}
```

---

## 5. Setup Integrations

### src/integrations/supabase.ts

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function syncPrivyUserToSupabase(privyUser: any) {
  const { error } = await supabase
    .from('users')
    .upsert(
      {
        privy_id: privyUser.id,
        email: privyUser.google?.email,
        name: privyUser.google?.name,
        google_id: privyUser.google?.subject,
        created_at: privyUser.createdAt,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'privy_id' }
    );

  if (error) throw error;
}
```

---

## 6. Create Hooks

### src/hooks/useUserRole.ts

```typescript
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase';

export function useUserRole() {
  const { user } = usePrivy();
  const [role, setRole] = useState<'sender' | 'recipient' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('privy_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        setRole(data?.role || null);
      } catch (error) {
        console.error('Failed to fetch role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user?.id]);

  return { role, isLoading };
}
```

---

## 7. Create Pages

### src/pages/LoginPage.tsx

```typescript
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LoginButton } from '@/components/LoginButton';

export default function LoginPage() {
  const { ready, authenticated } = usePrivy();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && authenticated) {
      navigate('/dashboard');
    }
  }, [ready, authenticated, navigate]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Initializing authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Kindred Flow</h1>
        <h2 className="text-lg text-gray-600 mb-8 text-center">Sign in to your account</h2>

        <LoginButton />

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Secure login powered by Privy</p>
        </div>
      </div>
    </div>
  );
}
```

### src/pages/OnboardingPage.tsx

```typescript
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const { user } = usePrivy();
  const navigate = useNavigate();

  const handleRoleSelect = async (role: 'sender' | 'recipient') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ role, profile_complete: true })
        .eq('privy_id', user.id);

      if (error) throw error;

      navigate(`/dashboard/${role}`);
    } catch (error) {
      toast.error('Failed to save role');
    }
  };

  if (!user) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Welcome to Kindred Flow</h1>
        <p className="text-center text-gray-600 mb-8">What's your role?</p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleRoleSelect('sender')}
            className="p-6 border-2 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition"
          >
            <h3 className="text-lg font-semibold mb-2">Sender</h3>
            <p className="text-gray-600">Send money internationally</p>
          </button>

          <button
            onClick={() => handleRoleSelect('recipient')}
            className="p-6 border-2 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition"
          >
            <h3 className="text-lg font-semibold mb-2">Recipient</h3>
            <p className="text-gray-600">Receive money from abroad</p>
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 8. Update App.tsx

```typescript
import { usePrivy } from '@privy-io/react-auth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import LoginPage from '@/pages/LoginPage';
import OnboardingPage from '@/pages/OnboardingPage';
import SenderDashboard from '@/pages/sender/SenderDashboard';
import RecipientDashboard from '@/pages/recipient/RecipientDashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  const { ready } = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route
            path="/dashboard/sender/*"
            element={
              <ProtectedRoute>
                <SenderDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/recipient/*"
            element={
              <ProtectedRoute>
                <RecipientDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster />
    </>
  );
}

export default App;
```

---

## 9. Database Schema (Supabase SQL)

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  privy_id VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE,
  name VARCHAR,
  google_id VARCHAR UNIQUE,
  role VARCHAR DEFAULT 'sender',
  profile_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_privy_id ON users(privy_id);
CREATE INDEX idx_users_email ON users(email);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (privy_id = current_user_id());
```

---

## 10. Testing Checklist

```typescript
// Test in browser console:

// 1. Check Privy initialization
console.log('Privy ready:', localStorage.getItem('privy-session'));

// 2. Check user data
const { user } = usePrivy();
console.log('User:', user);

// 3. Check Google OAuth data
console.log('Google email:', user?.google?.email);
console.log('Google ID:', user?.google?.subject);

// 4. Verify Supabase sync
// Check Supabase dashboard > users table

// 5. Test logout
const { logout } = usePrivy();
await logout();
// Should redirect to /login
```

---

## Key Points to Remember

1. **Always wrap app with PrivyProvider** at root level
2. **Wait for `ready` flag** before using Privy hooks
3. **Handle OAuth callbacks** with `onComplete` and `onError`
4. **Sync user data** to Supabase after login
5. **Use ProtectedRoute** for authenticated pages
6. **Show user-friendly errors** with error messages mapping
7. **Test on HTTPS** in production (not required for localhost)
8. **Add domains to Privy Dashboard** redirect URLs whitelist

---

## Deployment Checklist

- [ ] Set environment variables in production
- [ ] Test Google OAuth login
- [ ] Verify redirect URLs in Privy Dashboard
- [ ] Enable HTTPS for production domain
- [ ] Test on multiple browsers
- [ ] Verify Supabase sync
- [ ] Test role-based routing
- [ ] Monitor error logs
- [ ] Set up session timeout (optional)
- [ ] Test on mobile devices

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "redirect_uri_mismatch" | Domain not added to Google OAuth | Add domain to Google Cloud Console & Privy Dashboard |
| User not syncing to Supabase | Sync function not called | Verify `onComplete` callback runs after login |
| Session lost on refresh | Tokens not persisting | Privy handles this - check browser storage settings |
| OAuth not working in mobile browser | In-app browser incompatibility | Test in native browser app |
| Protected routes not working | `ProtectedRoute` not wrapping correctly | Ensure PrivyProvider wraps entire app first |

