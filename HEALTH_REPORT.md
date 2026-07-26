# HEALTH_REPORT.md

> Audit date: 2026-07-26
> Method: Build, typecheck, lint, test, live API endpoint hits, env validation, DB/Stripe connection tests

---

## Summary

| Check | Status | Severity |
|-------|--------|----------|
| Frontend build | PASS | — |
| Backend build | PASS | — |
| TypeScript (all packages) | PASS | — |
| Tests (32/32) | PASS | — |
| Environment variables | PASS | — |
| Database connection | PASS | — |
| Stripe connection | PASS | — |
| API health endpoint | PASS | — |
| Auth session endpoint | PASS | — |
| Brand extraction endpoint | PASS | — |
| Protected routes (401) | PASS | — |
| Lint | FAIL | HIGH |
| CI branch mismatch | FAIL | HIGH |
| Stripe price IDs invalid | FAIL | CRITICAL |
| Dockerfile missing preload | WARN | MEDIUM |
| ESLint not installed | FAIL | MEDIUM |
| Prisma major update available | WARN | LOW |

**Overall: 11 PASS, 4 FAIL, 2 WARN**

---

## 1. Frontend Build — PASS

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (29/29)
```

- 28 static routes + 1 dynamic (`/scans/[scanId]`)
- First Load JS shared by all: 87.3 kB
- Largest page: `/settings/account` (13.4 kB + 119 kB total)

---

## 2. Backend Build — PASS

```
tsc --noEmit → no errors
pnpm build (tsc) → success
```

All 16 modules compile cleanly.

---

## 3. TypeScript (all packages) — PASS

| Package | Status |
|---------|--------|
| `@saas/config` | PASS |
| `@saas/database` | PASS |
| `@saas/shared` | PASS |
| `@saas/ui` | PASS |
| `@saas/web` | PASS |
| `@saas/api` | PASS |

`pnpm typecheck` (recursive) — zero errors across all 6 packages.

---

## 4. Tests — PASS

```
✓ src/modules/brand-extract/__tests__/gradient-parser.test.ts (32 tests)
Test Files  1 passed (1)
     Tests  32 passed (32)
  Duration  2.36s
```

All 32 gradient parser tests pass. No other test files exist.

---

## 5. Environment Variables — PASS

All required variables present and validated via Zod schema:

| Variable | Status |
|----------|--------|
| `NODE_ENV` | SET (`development`) |
| `PORT` | SET (`3001`) |
| `DATABASE_URL` | SET (Neon) |
| `DIRECT_URL` | SET (Neon) |
| `BETTER_AUTH_SECRET` | SET (64 chars) |
| `BETTER_AUTH_URL` | SET |
| `WEB_APP_URL` | SET |
| `GOOGLE_CLIENT_ID` | SET |
| `GOOGLE_CLIENT_SECRET` | SET |
| `STRIPE_SECRET_KEY` | SET (test key) |
| `STRIPE_WEBHOOK_SECRET` | SET |
| `GITHUB_CLIENT_ID` | EMPTY (optional) |
| `GITHUB_CLIENT_SECRET` | EMPTY (optional) |
| `APPLE_CLIENT_ID` | EMPTY (optional) |
| `APPLE_CLIENT_SECRET` | EMPTY (optional) |

---

## 6. Database Connection — PASS

```
DB_CONNECTION: PASS
```

- Provider: PostgreSQL (Neon serverless)
- Prisma Client generated: v6.19.3
- Schema: 23 models
- `prisma db push` available for schema sync

---

## 7. Stripe Connection — PASS

```
STRIPE_CONNECTION: PASS
STRIPE_PRODUCTS_COUNT: 1
```

- API key: `sk_test_*` (test mode)
- Can list products successfully
- 1 product found in Stripe dashboard

---

## 8. API Routes — PASS

| Endpoint | Status | Result |
|----------|--------|--------|
| `GET /health` | 200 | `{"status":"ok"}` |
| `GET /api/v1/auth/session` | 200 | Session endpoint reachable |
| `POST /api/v1/brand-extract` | 200 | 12 colors, 8 logos, 5 gradients |
| `GET /api/v1/brand-profile` | 401 | Correctly rejects unauthenticated |

All tested endpoints respond as expected.

---

## 9. Brand Extraction — PASS

Extraction from `https://stripe.com`:

| Asset | Count |
|-------|-------|
| Colors | 12 |
| Fonts | 0 |
| Logos | 8 |
| Gradients | 5 |

Full pipeline works: URL fetch → HTML parse → CSS extraction → color/font/logo/gradient extraction → structured response.

---

## 10. OAuth Configuration — PASS (partial)

| Provider | Configured | UI Button |
|----------|-----------|-----------|
| Google | YES | YES |
| GitHub | NO (empty env) | NO |
| Apple | NO (empty env) | NO |

Google OAuth is fully configured and the only provider exposed in the login/register UI. GitHub and Apple are server-ready but env vars are empty.

---

## 11. Lint — FAIL (HIGH)

```
'eslint' is not recognized as an internal or external command
```

**Problem:** ESLint is not installed as a dependency in any package. The `lint` scripts in `packages/shared` and `packages/ui` call `eslint` directly but it's not available.

**Impact:** CI pipeline `pnpm lint` step will fail. Cannot enforce code quality.

**Fix:** Install eslint as a devDependency at root or in each package, or use `npx eslint`.

---

## 12. CI Branch Mismatch — FAIL (HIGH)

| Config | Branch |
|--------|--------|
| `.github/workflows/ci.yml` | Triggers on `main` |
| `render.yaml` | Deploys from `master` |

**Problem:** CI runs on `main` branch, but Render deploys from `master`. If the default branch is `master`, PRs to `main` won't trigger CI. If the default branch is `main`, Render won't auto-deploy.

**Impact:** CI/CD pipeline is broken — changes may not be tested or deployed correctly.

**Fix:** Align both to the same branch name (`main` or `master`).

---

## 13. Stripe Price IDs — FAIL (CRITICAL)

```
STRIPE_PRICE_ID_STARTER_MONTHLY=prod_Uv6m0Y490NO3xA    ← product ID, not price ID
STRIPE_PRICE_ID_STARTER_YEARLY=prod_Uv6m0Y490NO3xA     ← product ID, not price ID
STRIPE_PRICE_ID_PRO_MONTHLY=price_1TvGYgEEODeW5zFt4nj8SiPT  ← correct
STRIPE_PRICE_ID_PRO_YEARLY=prod_Uv6m0Y490NO3xA         ← product ID, not price ID
STRIPE_PRICE_ID_BUSINESS_MONTHLY=prod_Uv6m0Y490NO3xA   ← product ID, not price ID
STRIPE_PRICE_ID_BUSINESS_YEARLY=prod_Uv6m0Y490NO3xA    ← product ID, not price ID
STRIPE_PRICE_ID_BRAND_GUARD_LITE_MONTHLY=               ← EMPTY
```

**Problem:** 5 of 7 price IDs are set to `prod_*` (Stripe Product IDs) instead of `price_*` (Stripe Price IDs). Stripe Checkout requires Price IDs. One price ID is empty.

**Impact:** Checkout will fail for all plans except Pro Monthly. Users cannot subscribe.

**Fix:** Replace all `prod_*` values with actual `price_*` IDs from the Stripe dashboard.

---

## 14. Dockerfile Missing Preload — WARN (MEDIUM)

```dockerfile
CMD ["node", "apps/api/dist/index.js"]
```

**Problem:** The Docker CMD runs the compiled `dist/index.js` directly without loading `preload.ts`. In production (Render), env vars are injected as environment variables so this works. However, `start.sh` also doesn't use preload.

**Impact:** No immediate issue in production (Render injects env vars). But if someone runs the Docker image locally without setting env vars, it will crash with `Invalid environment variables`.

**Recommendation:** Document that env vars must be set externally, or add a production preload.

---

## 15. ESLint Not Installed — FAIL (MEDIUM)

```
packages/shared lint$ eslint src --ext .ts
'eslint' is not recognized as an internal or external command
```

**Problem:** No package has `eslint` in its dependencies. The `lint` scripts reference it but it's not installed.

**Impact:** Linting cannot run anywhere — locally or in CI.

**Fix:** Add `eslint` to root `devDependencies` and configure shared rules.

---

## 16. Prisma Update Available — WARN (LOW)

```
Update available 6.19.3 → 7.9.0
This is a major update
```

**Problem:** Prisma has a major version update available (v6 → v7).

**Impact:** No current issues. Major updates may have breaking changes.

**Recommendation:** Update when convenient, following the migration guide.

---

## Deployment Readiness

| Platform | Config | Issue |
|----------|--------|-------|
| **Vercel** (frontend) | `vercel.json` present | Build command correct, framework set |
| **Render** (backend) | `render.yaml` present | Branch mismatch with CI |
| **GitHub Actions** | `ci.yml` present | Triggers on wrong branch |
| **Docker** | `Dockerfile` present | Works but no local env loading |

### Vercel
- `buildCommand`: `pnpm --filter @saas/shared build && pnpm --filter @saas/ui build && pnpm --filter @saas/web build`
- `framework`: `nextjs`
- All 29 routes build successfully

### Render
- Runtime: Docker
- Health check: `/health` ✓
- Port: 10000
- All env vars marked `sync: false` (must be set manually in Render dashboard)

### GitHub Actions
- Matrix: Node 20, 22
- Steps: install → typecheck → lint → build → test
- **Will fail** on lint step (eslint not installed)

---

## Critical Fixes Required

1. **Stripe Price IDs** — Replace `prod_*` with `price_*` values. Checkout is broken for all plans except Pro Monthly.
2. **CI Branch** — Align `ci.yml` trigger branch with `render.yaml` deploy branch.
3. **ESLint** — Install eslint so lint scripts work.

---

*Generated from live testing. All build/test/connection tests executed against the actual codebase.*
