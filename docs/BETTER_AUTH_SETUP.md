# Better Auth Configuration

## Overview

Better Auth handles authentication, sessions, and user management.

## Configuration

The auth configuration is in `apps/api/src/lib/auth.ts`.

## Features Enabled

- Email/password authentication
- Email verification
- Forgot/reset password
- GitHub OAuth (optional)
- Session management
- Secure cookies
- Account linking

## Environment Variables

```env
BETTER_AUTH_SECRET=your-secret-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:3001
GITHUB_CLIENT_ID=optional
GITHUB_CLIENT_SECRET=optional
```

## API Endpoints

Better Auth provides these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/sign-up/email` | POST | Register with email |
| `/api/auth/sign-in/email` | POST | Sign in with email |
| `/api/auth/sign-out` | POST | Sign out |
| `/api/auth/forget-password` | POST | Request password reset |
| `/api/auth/reset-password` | POST | Reset password |
| `/api/auth/session` | GET | Get current session |
| `/api/auth/verify-email` | GET | Verify email address |
| `/api/auth/callback/github` | GET | GitHub OAuth callback |

## Frontend Integration

Use the auth context in React:

```typescript
import { useAuth } from '@/lib/auth-context';

function Component() {
  const { session, signIn, signUp, signOut, loading } = useAuth();
}
```

## Protected Routes

Wrap protected routes with the `ProtectedRoute` component:

```typescript
import { ProtectedRoute } from '@/lib/protected-route';

<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

## Backend Protection

Use middleware to protect API routes:

```typescript
import { requireAuth } from '../../middleware/require-auth.js';
import { requireWorkspaceMember } from '../../middleware/require-workspace.js';

router.get('/protected', requireAuth, requireWorkspaceMember(), handler);
```

## Security Notes

- Sessions expire after 7 days
- Sessions are updated every 24 hours
- Cookie cache is enabled for performance
- Email verification is required for full access
- GitHub OAuth is optional during development
