# Privy + Google OAuth Advanced Patterns & Best Practices

---

## Advanced Patterns

### 1. Session Management with Auto-Refresh

**Background Session Refresh:**

```typescript
// src/hooks/useSessionManager.ts
import { useEffect, useRef } from 'react';
import { useUser } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';

export function useSessionManager() {
  const { user, refreshUser } = useUser();
  const navigate = useNavigate();
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Refresh session every 25 minutes (access token is ~1 hour)
    refreshIntervalRef.current = setInterval(async () => {
      try {
        await refreshUser();
        console.log('[Session] Refreshed successfully');
      } catch (error) {
        console.error('[Session] Refresh failed, redirecting to login');
        navigate('/login');
      }
    }, 25 * 60 * 1000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshUser, navigate]);

  return { user };
}
```

### 2. Multi-Device Session Sync

**Sync Sessions Across Tabs:**

```typescript
// src/hooks/useSessionSync.ts
import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export function useSessionSync() {
  const { user } = usePrivy();

  useEffect(() => {
    // Broadcast login/logout to other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'privy-session-change') {
        // Another tab changed auth state
        // Refresh user data or redirect
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Broadcast our session changes to other tabs
    const broadcastSessionChange = () => {
      localStorage.setItem('privy-session-change', Date.now().toString());
    };

    // Broadcast on login
    if (user) {
      broadcastSessionChange();
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);
}
```

### 3. Deep Linking with OAuth

**Handle OAuth Redirects:**

```typescript
// src/hooks/useDeepLink.ts
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function useDeepLink() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const redirectTo = searchParams.get('redirect_to');
    const returnTo = searchParams.get('return_to');

    // After login, redirect to intended destination
    if (redirectTo) {
      navigate(redirectTo);
    } else if (returnTo) {
      navigate(returnTo);
    }
  }, [navigate, searchParams]);
}

// Usage in LoginPage:
// Navigate to /login?redirect_to=/dashboard/sender
// After OAuth completes, user redirected to /dashboard/sender
```

### 4. Consent Management

**Track User Consent:**

```typescript
// src/hooks/useConsent.ts
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase';
import { useEffect } from 'react';

export function useConsent() {
  const { user } = usePrivy();

  const acceptTerms = async () => {
    if (!user) return;

    await supabase
      .from('users')
      .update({ 
        has_accepted_terms: true,
        terms_accepted_at: new Date().toISOString()
      })
      .eq('privy_id', user.id);
  };

  const acceptPrivacy = async () => {
    if (!user) return;

    await supabase
      .from('user_consents')
      .insert({
        user_id: user.id,
        type: 'privacy_policy',
        accepted_at: new Date().toISOString()
      });
  };

  return { acceptTerms, acceptPrivacy };
}
```

### 5. OAuth Linking Multiple Accounts

**Allow users to link additional OAuth providers:**

```typescript
// src/hooks/useAccountLinking.ts
import { useLoginWithOAuth } from '@privy-io/react-auth';
import { usePrivy } from '@privy-io/react-auth';

export function useAccountLinking() {
  const { user } = usePrivy();
  const { initOAuth } = useLoginWithOAuth({
    onComplete: ({ linkedAccount }) => {
      console.log('Account linked:', linkedAccount?.type);
      // Update UI to show new linked account
    },
    onError: (error) => {
      console.error('Failed to link account:', error);
    }
  });

  const linkGitHub = () => {
    initOAuth({ provider: 'github' });
  };

  const linkDiscord = () => {
    initOAuth({ provider: 'discord' });
  };

  return {
    linkedAccounts: user?.linkedAccounts || [],
    linkGitHub,
    linkDiscord
  };
}
```

### 6. OAuth State Validation

**Validate OAuth state parameter:**

```typescript
// src/utils/oauth-state.ts
export function generateOAuthState(): string {
  const state = Math.random().toString(36).substring(7);
  sessionStorage.setItem('oauth_state', state);
  return state;
}

export function validateOAuthState(state: string): boolean {
  const savedState = sessionStorage.getItem('oauth_state');
  sessionStorage.removeItem('oauth_state'); // Clear after use
  return state === savedState;
}
```

---

## Error Handling Patterns

### 1. Comprehensive Error Handler

```typescript
// src/utils/auth-error-handler.ts
export enum AuthErrorCode {
  USER_CANCELLED = 'USER_CANCELLED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  REDIRECT_URI_MISMATCH = 'REDIRECT_URI_MISMATCH',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  OAUTH_ERROR = 'OAUTH_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export class AuthError extends Error {
  code: AuthErrorCode;
  retryable: boolean;

  constructor(
    message: string,
    code: AuthErrorCode = AuthErrorCode.UNKNOWN,
    retryable: boolean = false
  ) {
    super(message);
    this.code = code;
    this.retryable = retryable;
  }
}

export function parseOAuthError(error: any): AuthError {
  const errorString = error?.message?.toLowerCase() || '';

  if (errorString.includes('cancelled')) {
    return new AuthError('Login cancelled', AuthErrorCode.USER_CANCELLED, false);
  }

  if (errorString.includes('redirect_uri')) {
    return new AuthError(
      'Configuration error',
      AuthErrorCode.REDIRECT_URI_MISMATCH,
      false
    );
  }

  if (errorString.includes('network') || errorString.includes('fetch')) {
    return new AuthError(
      'Network error',
      AuthErrorCode.NETWORK_ERROR,
      true // Retryable
    );
  }

  if (errorString.includes('timeout')) {
    return new AuthError('Request timeout', AuthErrorCode.NETWORK_ERROR, true);
  }

  if (error?.code === 'OAUTH_ERROR') {
    return new AuthError(
      'OAuth provider error',
      AuthErrorCode.OAUTH_ERROR,
      true
    );
  }

  return new AuthError('Unknown error', AuthErrorCode.UNKNOWN, false);
}
```

### 2. Retry Logic with Exponential Backoff

```typescript
// src/utils/retry.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on non-retryable errors
      if (!isRetryable(error)) {
        throw error;
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

function isRetryable(error: any): boolean {
  const code = error?.code;
  const message = error?.message?.toLowerCase() || '';

  return (
    code === 'NETWORK_ERROR' ||
    code === 'TIMEOUT' ||
    message.includes('network') ||
    message.includes('timeout')
  );
}
```

### 3. Error Boundary Component

```typescript
// src/components/AuthErrorBoundary.tsx
import { ReactNode, ErrorInfo } from 'react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Auth Error]', error, errorInfo);
    toast.error('Authentication error. Please refresh the page.');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Authentication Error</h2>
            <p className="text-gray-600 mb-4">Please refresh the page to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Security Patterns

### 1. CSRF Protection

```typescript
// src/utils/csrf.ts
export function generateCSRFToken(): string {
  const token = Math.random().toString(36).substring(2, 15) +
               Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('csrf_token', token);
  return token;
}

export function validateCSRFToken(token: string): boolean {
  const saved = sessionStorage.getItem('csrf_token');
  return token === saved;
}

// Usage in API calls:
const headers = {
  'X-CSRF-Token': generateCSRFToken()
};
```

### 2. Secure OAuth Flow with PKCE

```typescript
// src/utils/pkce.ts (for custom implementations)
import { base64url, randomBytes } from 'crypto';

export function generatePKCE() {
  const codeVerifier = base64url(randomBytes(32));
  const codeChallenge = base64url(
    crypto.createHash('sha256').update(codeVerifier).digest()
  );
  
  return { codeVerifier, codeChallenge };
}

// Note: Privy handles PKCE automatically for supported providers
```

### 3. Rate Limiting on Backend

```typescript
// Backend (example with Express)
import rateLimit from 'express-rate-limit';

const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,      // 15 minutes
  max: 5,                          // 5 attempts
  message: 'Too many auth attempts',
  standardHeaders: true,
  legacyHeaders: false
});

app.post('/api/auth/verify', oauthLimiter, async (req, res) => {
  // Verify OAuth session
});
```

### 4. Secure Header Configuration

```typescript
// Backend middleware
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CORS for OAuth redirects
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS);
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  next();
});
```

---

## Performance Patterns

### 1. Lazy Load Authentication

```typescript
// src/components/LazyAuthProvider.tsx
import { Suspense, lazy } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

const AuthApp = lazy(() => import('./AuthApp'));

export function LazyAuthProvider() {
  return (
    <PrivyProvider appId={...}>
      <Suspense fallback={<div>Loading...</div>}>
        <AuthApp />
      </Suspense>
    </PrivyProvider>
  );
}
```

### 2. Memoize User Data

```typescript
// src/hooks/useMemoizedUser.ts
import { usePrivy } from '@privy-io/react-auth';
import { useMemo } from 'react';

export function useMemoizedUser() {
  const { user } = usePrivy();

  const memoized = useMemo(() => ({
    id: user?.id,
    email: user?.google?.email,
    role: user?.customMetadata?.role
  }), [user?.id, user?.google?.email, user?.customMetadata?.role]);

  return memoized;
}
```

### 3. Cache User Data

```typescript
// src/hooks/useCachedUser.ts
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useRef, useState } from 'react';

export function useCachedUser() {
  const { user } = usePrivy();
  const cacheRef = useRef<any>(null);
  const [cachedUser, setCachedUser] = useState(null);

  useEffect(() => {
    if (user) {
      cacheRef.current = user;
      setCachedUser(user);
    }
  }, [user?.id]); // Only update on ID change

  return cachedUser || cacheRef.current;
}
```

---

## Testing Patterns

### 1. Mock Privy for Testing

```typescript
// src/__mocks__/privy.ts
import { vi } from 'vitest';

export const usePrivy = vi.fn(() => ({
  ready: true,
  authenticated: true,
  user: {
    id: 'test-user-id',
    google: {
      email: 'test@example.com',
      name: 'Test User',
      subject: 'test-subject'
    }
  },
  logout: vi.fn()
}));

export const useLoginWithOAuth = vi.fn(() => ({
  state: { status: 'done' },
  initOAuth: vi.fn().mockResolvedValue(undefined)
}));
```

### 2. Test Protected Routes

```typescript
// src/__tests__/ProtectedRoute.test.tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { vi } from 'vitest';

// Mock usePrivy
vi.mock('@privy-io/react-auth', () => ({
  usePrivy: () => ({
    ready: true,
    authenticated: false
  })
}));

test('redirects to login when not authenticated', () => {
  render(
    <BrowserRouter>
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    </BrowserRouter>
  );

  // Should not show protected content
  expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
});
```

### 3. Test OAuth Flow

```typescript
// src/__tests__/LoginButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginButton } from '@/components/LoginButton';
import { vi } from 'vitest';

vi.mock('@privy-io/react-auth', () => ({
  useLoginWithOAuth: () => ({
    state: { status: 'initial' },
    initOAuth: vi.fn().mockResolvedValue(undefined)
  })
}));

test('calls initOAuth on button click', async () => {
  const { initOAuth } = require('@privy-io/react-auth').useLoginWithOAuth();

  render(<LoginButton />);

  const button = screen.getByText('Login with Google');
  fireEvent.click(button);

  expect(initOAuth).toHaveBeenCalledWith({ provider: 'google' });
});
```

---

## Monitoring & Analytics

### 1. Auth Event Tracking

```typescript
// src/utils/auth-analytics.ts
import { Analytics } from '@segment/analytics-next';

const analytics = new Analytics();

export const trackAuthEvent = {
  loginAttempt: (provider: string) => {
    analytics.track('auth_login_attempt', { provider });
  },

  loginSuccess: (userId: string, isNewUser: boolean) => {
    analytics.track('auth_login_success', { userId, isNewUser });
  },

  loginError: (error: string, provider: string) => {
    analytics.track('auth_login_error', { error, provider });
  },

  logout: (userId: string) => {
    analytics.track('auth_logout', { userId });
  },

  roleSelected: (userId: string, role: string) => {
    analytics.track('auth_role_selected', { userId, role });
  }
};
```

### 2. Error Logging

```typescript
// src/utils/error-logging.ts
export async function logAuthError(error: any) {
  const payload = {
    message: error.message,
    code: error.code,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  try {
    await fetch('/api/logs/auth-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error('Failed to log error:', e);
  }
}
```

---

## Deployment Checklist

```
Production Deployment
├─ Security
│  ├─ HTTPS enabled
│  ├─ Security headers configured
│  ├─ CORS properly configured
│  ├─ Rate limiting enabled
│  └─ Sensitive data not in logs
├─ Configuration
│  ├─ Environment variables set
│  ├─ Google OAuth credentials updated
│  ├─ Privy app ID for production
│  ├─ Supabase production database
│  └─ Redirect URIs whitelisted
├─ Testing
│  ├─ OAuth flow tested
│  ├─ Token refresh tested
│  ├─ Session persistence tested
│  ├─ Error scenarios tested
│  └─ Mobile compatibility tested
├─ Monitoring
│  ├─ Error tracking enabled
│  ├─ Analytics configured
│  ├─ Health checks set up
│  └─ Alerts configured
└─ Documentation
   ├─ Runbooks created
   ├─ Support processes defined
   └─ On-call procedures ready
```

---

## Quick Reference

| Feature | Package | Hook | Link |
|---------|---------|------|------|
| Authentication | `@privy-io/react-auth` | `usePrivy()` | [Docs](https://docs.privy.io) |
| OAuth Login | `@privy-io/react-auth` | `useLoginWithOAuth()` | [OAuth Guide](https://docs.privy.io/authentication/user-authentication/login-methods/oauth) |
| Session Mgmt | `@privy-io/react-auth` | `useUser()` | [Session Guide](https://docs.privy.io/authentication/user-authentication/authentication-state.md) |
| Database | `@supabase/supabase-js` | Custom hook | [Supabase Docs](https://supabase.com/docs) |

