# Privy + Google OAuth Integration Research Guide

**For: Fintech Application (Kindred Flow) - React/TypeScript**

---

## Table of Contents
1. [Privy + Google OAuth Integration Setup](#1-privy--google-oauth-integration)
2. [Implementation Steps](#2-implementation-steps)
3. [React Component Architecture](#3-react-component-architecture)
4. [Security Considerations](#4-security-considerations)
5. [Error Handling](#5-error-handling)
6. [Integration with Existing Code](#6-integration-with-existing-code)

---

## 1. Privy + Google OAuth Integration

### 1.1 How to Set Up Privy with Google OAuth Provider

**Supported Platforms:**
- React (Google OAuth natively supported)
- React Native (Google OAuth supported)
- Android (Google OAuth supported)
- iOS/Swift (Google OAuth supported)

**Important Limitation:**
Google OAuth login may NOT work in in-app browsers (IABs) embedded in social apps due to Google's restrictions. Other OAuth providers are generally unaffected.

### 1.2 Configuration Requirements

#### Step 1: Create/Setup Google OAuth in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → Create OAuth 2.0 Client ID
5. Select "Web application"
6. Configure Redirect URIs:
   - Development: `http://localhost:3000` (for local dev)
   - Production: `https://yourdomain.com`
   - **IMPORTANT:** Add Privy's callback URL: `https://auth.privy.io/api/v1/oauth/callback`
7. Note your **Client ID** and **Client Secret**

#### Step 2: Configure in Privy Dashboard

1. Go to [Privy Dashboard](https://dashboard.privy.io)
2. Select your app
3. Navigate to **Settings → Login Methods**
4. Enable **Google OAuth**
5. Enter your Google credentials:
   - Client ID (from Google Cloud Console)
   - Client Secret (from Google Cloud Console)
6. Configure allowed OAuth redirect URLs (for your app domains)

### 1.3 Callback Handling

**How Privy Handles OAuth Callbacks:**

After user authenticates with Google:
1. Google redirects to `https://auth.privy.io/api/v1/oauth/callback`
2. Privy exchanges the authorization code for tokens
3. Privy creates/updates the user in its system
4. User is automatically redirected back to your app
5. `usePrivy()` hook updates with authenticated user data

**Redirect URL Configuration:**
- Configure allowed OAuth redirect URLs in Privy Dashboard
- Add all your app domains where OAuth should work
- Prevents unauthorized redirects for security

### 1.4 User Session Management

**Session Lifecycle:**

```
1. Initial Load
   ├─ PrivyProvider initializes
   ├─ Checks for cached session tokens
   └─ Validates tokens with Privy backend

2. OAuth Login Flow
   ├─ User clicks "Login with Google"
   ├─ Redirected to Google login
   ├─ Google redirects back to Privy callback
   ├─ Privy creates session tokens
   └─ User redirected to your app (authenticated)

3. Active Session
   ├─ Access token stored securely by Privy SDK
   ├─ Session tokens auto-refreshed on expiry
   └─ User remains authenticated across page reloads

4. Session Termination
   ├─ User clicks logout
   ├─ Tokens removed from device
   └─ User must re-authenticate
```

**Token Management:**

- **Access Tokens**: Short-lived tokens (typically 1 hour)
- **Refresh Tokens**: Long-lived tokens used to get new access tokens
- **Token Storage**: Privy stores tokens securely (not accessible to your JavaScript)
- **Auto-Refresh**: Privy SDK automatically refreshes tokens before expiry

### 1.5 Best Practices

1. **Always wait for `ready` flag**
   ```typescript
   const { ready, authenticated, user } = usePrivy();
   if (!ready) return <LoadingSpinner />;
   ```

2. **Handle OAuth state properly**
   - Track state with `useLoginWithOAuth` hook
   - Watch for 'loading', 'done', and 'error' states

3. **Implement error callbacks**
   ```typescript
   onError: (error) => {
     // Handle OAuth errors gracefully
     // Show user-friendly error messages
   }
   ```

4. **Secure redirect URLs**
   - Only allow trusted domains
   - Use HTTPS in production
   - Whitelist specific paths

5. **Don't expose tokens**
   - Never log or share tokens
   - Never send tokens to third-party services
   - Privy manages tokens securely

6. **Implement refresh strategy**
   - Use `refreshUser()` after backend updates
   - Privy auto-handles token refresh

---

## 2. Implementation Steps

### 2.1 Environment Variables

**Required Environment Variables:**

```bash
# .env.local (development)
VITE_PRIVY_APP_ID=your-privy-app-id
VITE_PRIVY_CLIENT_ID=your-privy-client-id

# .env.production
VITE_PRIVY_APP_ID=prod-privy-app-id
VITE_PRIVY_CLIENT_ID=prod-privy-client-id
```

**Important:**
- Store in `.env` files (never commit secrets)
- Use `VITE_` prefix for Vite apps (accessible in browser)
- Privy handles Google credentials - they're configured in dashboard

### 2.2 Privy SDK Installation

```bash
# Install Privy React SDK
npm install @privy-io/react-auth@latest

# Or with yarn/pnpm
yarn add @privy-io/react-auth@latest
pnpm install @privy-io/react-auth@latest
```

**Requirements:**
- React 18 or higher
- TypeScript 5 or higher
- Your project already meets these (Vite + React)

### 2.3 PrivyProvider Setup

**Location: src/main.tsx or src/App.tsx (root component)**

```typescript
// src/main.tsx
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
        // Create embedded wallets for users who don't have one
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
        },
        // Optional: Customize appearance
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        }
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
```

**Configuration Options:**
- `appId`: Your Privy app ID (required)
- `clientId`: Optional - for app clients with different configs
- `config.embeddedWallets`: Auto-create wallets on first login
- `config.appearance`: Customize UI colors and theme

### 2.4 Login/Logout Flow Implementation

**Basic Login Component:**

```typescript
// src/components/LoginButton.tsx
import { useLoginWithOAuth } from '@privy-io/react-auth';

export function LoginButton() {
  const { state, initOAuth } = useLoginWithOAuth({
    onComplete: ({ user, isNewUser }) => {
      console.log('Login successful', user.id);
      if (isNewUser) {
        // Handle new user onboarding
      }
    },
    onError: (error) => {
      console.error('Login failed:', error.message);
      // Show error toast to user
    }
  });

  const handleGoogleLogin = async () => {
    try {
      await initOAuth({ provider: 'google' });
    } catch (err) {
      console.error('OAuth error:', err);
    }
  };

  return (
    <button 
      onClick={handleGoogleLogin}
      disabled={state.status === 'loading'}
    >
      {state.status === 'loading' ? 'Logging in...' : 'Login with Google'}
    </button>
  );
}
```

**Logout Component:**

```typescript
// src/components/LogoutButton.tsx
import { usePrivy, useLogout } from '@privy-io/react-auth';

export function LogoutButton() {
  const { ready, authenticated } = usePrivy();
  const { logout } = useLogout({
    onSuccess: () => {
      console.log('Logged out successfully');
      // Redirect to login page or home
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    }
  });

  if (!ready || !authenticated) return null;

  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

**Protected Route Component:**

```typescript
// src/components/ProtectedRoute.tsx
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
    // Wait for Privy to initialize
    if (ready && !authenticated) {
      navigate('/login');
    }
  }, [ready, authenticated, navigate]);

  if (!ready) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!authenticated) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
```

---

## 3. React Component Architecture

### 3.1 Login Page with Privy

```typescript
// src/pages/LoginPage.tsx
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LoginButton } from '@/components/LoginButton';

export default function LoginPage() {
  const { ready, authenticated } = usePrivy();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
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
          <p>Protected by Privy OAuth</p>
        </div>
      </div>
    </div>
  );
}
```

### 3.2 Accessing Authenticated User Data

**User Object Structure:**

```typescript
interface User {
  id: string;                      // Privy DID
  createdAt: string;              // ISO 8601 datetime
  linkedAccounts: LinkedAccount[];
  email?: { address: string };
  google?: {
    subject: string;              // Google user ID
    email: string;
    name: string | null;
  };
  wallet?: {
    address: string;
    chainType: 'ethereum' | 'solana';
  };
  // ... other account types
}
```

**Using User Data:**

```typescript
// src/components/UserProfile.tsx
import { usePrivy } from '@privy-io/react-auth';

export function UserProfile() {
  const { ready, authenticated, user } = usePrivy();

  if (!ready || !authenticated || !user) {
    return null;
  }

  // Access Google OAuth data
  if (user.google) {
    return (
      <div>
        <h2>Welcome, {user.google.name}</h2>
        <p>Email: {user.google.email}</p>
        <p>Google ID: {user.google.subject}</p>
      </div>
    );
  }

  return <p>No Google account linked</p>;
}
```

**Get All Linked Accounts:**

```typescript
import { usePrivy } from '@privy-io/react-auth';

export function LinkedAccountsList() {
  const { user } = usePrivy();

  if (!user) return null;

  return (
    <div>
      <h3>Linked Accounts</h3>
      <ul>
        {user.linkedAccounts?.map((account) => (
          <li key={account.type}>
            {account.type === 'google_oauth' && (
              <span>Google: {account.email}</span>
            )}
            {account.type === 'email' && (
              <span>Email: {account.address}</span>
            )}
            {account.type === 'wallet' && (
              <span>Wallet: {account.address}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.3 Auth State in App Routing

**Root App Component:**

```typescript
// src/App.tsx
import { usePrivy } from '@privy-io/react-auth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import SenderDashboard from '@/pages/sender/SenderDashboard';
import RecipientDashboard from '@/pages/recipient/RecipientDashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  const { ready } = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/dashboard/sender"
          element={
            <ProtectedRoute>
              <SenderDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard/recipient"
          element={
            <ProtectedRoute>
              <RecipientDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 3.4 User Data Structure

**Complete User Structure from Privy:**

```typescript
// Google OAuth Account
{
  type: 'google_oauth';
  subject: string;          // Google user ID ('sub' from JWT)
  email: string;           // user@gmail.com
  name: string | null;     // User's Google name
}

// Email Account (if linked)
{
  type: 'email';
  address: string;         // Email address
}

// Wallet Account (if created)
{
  type: 'wallet';
  address: string;         // Wallet address (0x...)
  chainType: 'ethereum' | 'solana';
  walletClientType: string;
  connectorType: string;
}

// Full User Object
{
  id: 'did:privy:...',
  createdAt: '2024-01-31T10:30:00Z',
  linkedAccounts: [
    { type: 'google_oauth', email: 'user@gmail.com', ... }
  ],
  email?: { address: 'user@gmail.com' },
  google?: { email: 'user@gmail.com', name: 'John Doe', ... },
  wallet?: { address: '0x...', chainType: 'ethereum' },
  mfaMethods: [],
  hasAcceptedTerms: false,
  isGuest: false
}
```

---

## 4. Security Considerations

### 4.1 Token Management

**How Privy Manages Tokens:**

1. **Token Storage**
   - Tokens stored in browser memory and secure storage
   - NOT accessible to your JavaScript code
   - Privy SDK handles all token operations

2. **Token Lifecycle**
   ```
   User Authenticates
   ├─ Google provides authorization code
   ├─ Privy exchanges code for tokens
   ├─ Access token (short-lived, ~1 hour)
   └─ Refresh token (long-lived, auto-rotated)
   ```

3. **Auto-Refresh**
   - Privy automatically refreshes tokens before expiry
   - You don't need to handle refresh manually
   - SDK ensures tokens are always valid

**Never:**
- Log tokens to console
- Send tokens to third-party APIs
- Store tokens in localStorage (Privy handles this securely)
- Expose tokens in URLs

### 4.2 Session Security

**Best Practices:**

1. **HTTPS Only**
   ```typescript
   // Ensure all auth redirects use HTTPS
   // Configure in Privy Dashboard:
   // - Production URLs must be HTTPS
   // - Add your domain to allowed URLs
   ```

2. **CORS Configuration**
   ```typescript
   // Privy handles CORS for OAuth flows
   // Ensure your app domain is whitelisted
   ```

3. **Content Security Policy (CSP)**
   ```html
   <!-- Required for Privy -->
   <meta http-equiv="Content-Security-Policy" content="
     default-src 'self';
     script-src 'self' 'unsafe-inline' https://auth.privy.io;
     connect-src 'self' https://auth.privy.io https://api.privy.io;
     frame-src https://auth.privy.io
   ">
   ```

4. **Session Validation**
   ```typescript
   // Always check ready and authenticated
   const { ready, authenticated, user } = usePrivy();
   if (!ready) return <Loading />;
   if (!authenticated) return <Redirect to="/login" />;
   ```

### 4.3 Rate Limiting

**Implement Rate Limiting on Backend:**

```typescript
// Backend example (Express.js)
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts
  message: 'Too many login attempts, please try again later'
});

app.post('/api/auth/verify-session', loginLimiter, async (req, res) => {
  // Verify Privy session on backend
});
```

**Client-Side Rate Limiting:**

```typescript
export function LoginButton() {
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(false);

  const handleLogin = async () => {
    if (attempts >= 3) {
      setCooldown(true);
      setTimeout(() => {
        setAttempts(0);
        setCooldown(false);
      }, 60000); // 1 minute cooldown
      return;
    }

    setAttempts(prev => prev + 1);
    // ... proceed with login
  };

  return (
    <button disabled={cooldown}>
      {cooldown ? 'Try again in 1 minute' : 'Login with Google'}
    </button>
  );
}
```

### 4.4 Error Handling

**Secure Error Handling:**

```typescript
// GOOD: User-friendly error
try {
  await initOAuth({ provider: 'google' });
} catch (error) {
  toast.error('Login failed. Please try again.');
  console.error('[Internal]', error); // Log internally only
}

// BAD: Exposing sensitive info
catch (error) {
  toast.error(`Error: ${error.message}`); // Could expose system details
}
```

### 4.5 CORS and Security Headers

**Required Headers (Privy handles most):**

```typescript
// Your backend should set:
{
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS,
  'Access-Control-Allow-Credentials': 'true',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block'
}
```

---

## 5. Error Handling

### 5.1 Common Privy/Google OAuth Errors

**1. User Cancelled Login**
```typescript
// Error code: USER_CANCELLED
// User clicked cancel during OAuth flow
const handleLoginError = (error: Error) => {
  if (error.message.includes('cancelled')) {
    toast.info('Login cancelled');
  }
};
```

**2. OAuth Provider Error**
```typescript
// Google server error or invalid config
// Error: "Invalid client_id"
// Solution: Verify Google Cloud credentials in Privy Dashboard
```

**3. Redirect URI Mismatch**
```typescript
// Most common error
// "redirect_uri_mismatch"
// Solution: Add app domain to Google Cloud + Privy Dashboard
```

**4. Network/Connectivity Issues**
```typescript
// User loses connection during OAuth
// Error: "Network error"
// Solution: Implement retry logic
```

**5. Session Expired**
```typescript
// User's session token expired
// Solution: Privy auto-refreshes, but handle manually:
const { refreshUser } = useUser();
const handleSessionExpired = async () => {
  try {
    await refreshUser();
  } catch {
    // Re-prompt to login
    navigate('/login');
  }
};
```

### 5.2 User-Friendly Error Messages

```typescript
// src/utils/error-messages.ts
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  USER_CANCELLED: 'Login cancelled. Please try again.',
  NETWORK_ERROR: 'Connection lost. Please check your internet.',
  INVALID_CREDENTIALS: 'Email or password incorrect.',
  ACCOUNT_LOCKED: 'Too many failed attempts. Please try later.',
  SESSION_EXPIRED: 'Your session expired. Please login again.',
  OAUTH_ERROR: 'Could not connect to Google. Please try another method.',
  SERVER_ERROR: 'Server error. Please try again later.',
  DEFAULT: 'Something went wrong. Please try again.'
};

export function getErrorMessage(error: any): string {
  if (error?.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }
  if (error?.message && error.message.includes('redirect_uri')) {
    return 'Configuration error. Please contact support.';
  }
  return AUTH_ERROR_MESSAGES.DEFAULT;
}
```

**Error Component:**

```typescript
// src/components/AuthError.tsx
import { useEffect } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/error-messages';

interface AuthErrorProps {
  error: Error | null;
  onDismiss?: () => void;
}

export function AuthError({ error, onDismiss }: AuthErrorProps) {
  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error));
      onDismiss?.();
    }
  }, [error]);

  return null;
}
```

### 5.3 Recovery Flows

**1. Automatic Retry on Network Error:**
```typescript
export function LoginButton() {
  const { initOAuth, state } = useLoginWithOAuth();
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleLogin = async () => {
    try {
      await initOAuth({ provider: 'google' });
      setRetryCount(0);
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        await new Promise(r => setTimeout(r, 1000 * retryCount)); // Exponential backoff
        await handleLogin(); // Retry
      }
    }
  };

  return (
    <button onClick={handleLogin} disabled={state.status === 'loading'}>
      {state.status === 'loading' ? 'Logging in...' : 'Login with Google'}
    </button>
  );
}
```

**2. Re-authentication on Session Expiry:**
```typescript
import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';

export function SessionManager() {
  const { user, refreshUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Periodically refresh user session
        await refreshUser();
      } catch {
        // Session invalid, redirect to login
        toast.error('Session expired. Please login again.');
        navigate('/login');
      }
    };

    const interval = setInterval(checkSession, 30 * 60 * 1000); // Every 30 mins
    return () => clearInterval(interval);
  }, []);

  return null;
}
```

**3. Fallback Login Methods:**
```typescript
export function LoginPage() {
  return (
    <div className="space-y-4">
      <LoginButton provider="google" />
      
      <div className="text-center text-gray-600">or</div>
      
      {/* Fallback method */}
      <button className="w-full">
        Login with Email
      </button>
    </div>
  );
}
```

### 5.4 Debugging Tips

**1. Enable Debug Logging:**
```typescript
// In PrivyProvider setup
<PrivyProvider
  appId={...}
  config={{
    debug: true  // Enable Privy debug logging
  }}
>
```

**2. Check Network Requests:**
```
1. Open DevTools → Network tab
2. Look for requests to auth.privy.io
3. Check response status and headers
4. Verify redirect URLs
```

**3. Console Logging:**
```typescript
const { state, initOAuth } = useLoginWithOAuth({
  onComplete: ({ user, isNewUser }) => {
    console.log('[Auth] Login successful', { userId: user.id, isNewUser });
  },
  onError: (error) => {
    console.error('[Auth] Login failed', {
      message: error.message,
      code: (error as any).code,
      timestamp: new Date().toISOString()
    });
  }
});
```

**4. Local Storage Inspection:**
```typescript
// Check Privy session storage (in DevTools Console)
console.log(localStorage.getItem('privy-session'));
console.log(sessionStorage.getItem('privy-token'));
```

**5. Common Issues Checklist:**
- [ ] Privy App ID is correct
- [ ] Google OAuth enabled in Privy Dashboard
- [ ] Google Cloud credentials configured
- [ ] Redirect URIs added to both Google Cloud & Privy
- [ ] App domain whitelisted in Privy
- [ ] Using HTTPS in production
- [ ] PrivyProvider wraps entire app
- [ ] Waiting for `ready` before using Privy hooks

---

## 6. Integration with Existing Code

### 6.1 Connect to Supabase

**Why Connect Both?**
- Privy: Handles authentication
- Supabase: Stores user data, profiles, and app-specific info

**User Sync Flow:**

```
1. User logs in with Google via Privy
2. Privy returns user object with Google data
3. You verify/create user record in Supabase
4. Store Privy user ID + Google data in Supabase
5. Use Privy ID as foreign key for user records
```

**Implementation:**

```typescript
// src/integrations/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Sync Privy user to Supabase
export async function syncPrivyUserToSupabase(privyUser: any) {
  const { data, error } = await supabase
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
  return data;
}
```

**Post-Login Sync:**

```typescript
// src/pages/LoginPage.tsx
const { initOAuth } = useLoginWithOAuth({
  onComplete: async ({ user, isNewUser }) => {
    try {
      // Sync to Supabase
      await syncPrivyUserToSupabase(user);
      
      if (isNewUser) {
        // Redirect to onboarding
        navigate('/onboarding');
      } else {
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Failed to save user data');
      console.error('Sync error:', error);
    }
  }
});
```

### 6.2 How to Store User Data

**Database Schema:**

```sql
-- users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  privy_id VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE,
  name VARCHAR,
  google_id VARCHAR UNIQUE,
  role VARCHAR DEFAULT 'sender', -- or 'recipient'
  profile_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  avatar_url VARCHAR,
  bio TEXT,
  phone VARCHAR,
  country VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  theme VARCHAR DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  currency VARCHAR DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**TypeScript Types:**

```typescript
// src/types/user.ts
export interface User {
  id: string;
  privy_id: string;
  email: string | null;
  name: string | null;
  google_id: string | null;
  role: 'sender' | 'recipient';
  profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  country: string | null;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  notifications_enabled: boolean;
  currency: string;
}
```

### 6.3 Manage Roles (Sender/Recipient)

**Role Assignment:**

```typescript
// src/pages/OnboardingPage.tsx
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase';

export function OnboardingPage() {
  const { user } = usePrivy();
  const [selectedRole, setSelectedRole] = useState<'sender' | 'recipient' | null>(null);

  const handleRoleSelect = async (role: 'sender' | 'recipient') => {
    if (!user) return;

    try {
      await supabase
        .from('users')
        .update({ role, profile_complete: true })
        .eq('privy_id', user.id);

      // Redirect to role-specific dashboard
      navigate(`/dashboard/${role}`);
    } catch (error) {
      toast.error('Failed to save role');
    }
  };

  return (
    <div className="space-y-4">
      <h1>What's your role?</h1>

      <button
        onClick={() => handleRoleSelect('sender')}
        className="p-4 border rounded"
      >
        <h3>Sender</h3>
        <p>Send money internationally</p>
      </button>

      <button
        onClick={() => handleRoleSelect('recipient')}
        className="p-4 border rounded"
      >
        <h3>Recipient</h3>
        <p>Receive money from abroad</p>
      </button>
    </div>
  );
}
```

**Role-Based Routing:**

```typescript
// src/App.tsx
import { usePrivy } from '@privy-io/react-auth';
import { useUserRole } from '@/hooks/useUserRole';

function App() {
  const { ready, authenticated } = usePrivy();
  const { role, isLoading } = useUserRole();

  if (!ready || isLoading) return <div>Loading...</div>;

  if (!authenticated) return <Navigate to="/login" />;

  if (!role) return <Navigate to="/onboarding" />;

  return (
    <Routes>
      <Route path={`/dashboard/${role}/*`} element={<DashboardLayout />} />
      {/* ... other routes */}
    </Routes>
  );
}
```

**Hook for Getting User Role:**

```typescript
// src/hooks/useUserRole.ts
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

        if (error) throw error;
        setRole(data?.role);
      } catch (error) {
        console.error('Failed to fetch role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { role, isLoading };
}
```

### 6.4 Persist User Preferences

**Save Preferences:**

```typescript
// src/hooks/useUserPreferences.ts
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase';

export function useUserPreferences() {
  const { user } = usePrivy();
  const [preferences, setPreferences] = useState<any>(null);

  // Fetch preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setPreferences(data);
    };

    fetchPreferences();
  }, [user?.id]);

  // Update preferences
  const updatePreferences = async (updates: any) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', user.id);

    if (error) throw error;

    setPreferences(prev => ({ ...prev, ...updates }));
  };

  return { preferences, updatePreferences };
}
```

**Using Preferences:**

```typescript
// src/components/ThemeSwitcher.tsx
import { useUserPreferences } from '@/hooks/useUserPreferences';

export function ThemeSwitcher() {
  const { preferences, updatePreferences } = useUserPreferences();

  const handleThemeChange = async (theme: 'light' | 'dark') => {
    await updatePreferences({ theme });
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  };

  return (
    <button onClick={() => handleThemeChange(preferences?.theme === 'light' ? 'dark' : 'light')}>
      Theme: {preferences?.theme}
    </button>
  );
}
```

---

## Quick Reference

### Installation Checklist
- [ ] Install `@privy-io/react-auth`
- [ ] Create Privy app in dashboard
- [ ] Get Privy App ID and Client ID
- [ ] Create Google OAuth in Google Cloud Console
- [ ] Add redirect URIs to Google Cloud
- [ ] Configure in Privy Dashboard
- [ ] Set environment variables
- [ ] Wrap app with `PrivyProvider`

### Implementation Checklist
- [ ] Create LoginPage component
- [ ] Create LogoutButton component
- [ ] Create ProtectedRoute component
- [ ] Add routing logic
- [ ] Implement error handling
- [ ] Connect to Supabase
- [ ] Set up role management
- [ ] Test with local dev server
- [ ] Deploy and verify on production

### Testing Checklist
- [ ] Login with Google works
- [ ] User data displays correctly
- [ ] Logout clears session
- [ ] Protected routes redirect properly
- [ ] Refresh page maintains session
- [ ] Multiple tabs stay in sync
- [ ] Error messages show correctly
- [ ] Mobile OAuth works
- [ ] Works across different browsers

---

## Additional Resources

- **Privy Docs:** https://docs.privy.io
- **Google OAuth Docs:** https://developers.google.com/identity/protocols/oauth2
- **Privy React Setup:** https://docs.privy.io/basics/react/setup
- **Privy OAuth Guide:** https://docs.privy.io/authentication/user-authentication/login-methods/oauth
- **Privy GitHub Examples:** https://github.com/privy-io/examples

