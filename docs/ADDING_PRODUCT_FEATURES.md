# Adding Product Features

This guide explains how to extend the SaaS foundation with product-specific features.

## Overview

The foundation is designed with clear extension points. When you receive a product brief, follow these steps to add product-specific functionality without modifying the core SaaS infrastructure.

## Step 1: Add Database Models

Add product-specific models to `packages/database/prisma/schema.prisma`:

```prisma
// ─── Product Models ──────────────────────────────────────────────────────────

model product_entity {
  id          String   @id @default(cuid())
  workspaceId String
  workspace   workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  name        String
  // Add product-specific fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([workspaceId])
  @@map("product_entities")
}
```

Then regenerate the Prisma Client:

```bash
pnpm db:generate
pnpm db:push
```

## Step 2: Add API Routes

Create a new module in `apps/api/src/modules/product/`:

```typescript
// apps/api/src/modules/product/routes.ts
import { Router } from 'express';
import { prisma } from '@saas/database';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireWorkspaceMember } from '../../middleware/require-workspace.js';

const router = Router();

router.get('/:workspaceId/entities', requireAuth, requireWorkspaceMember(), async (req, res) => {
  const entities = await prisma.productEntity.findMany({
    where: { workspaceId: req.params.workspaceId },
  });
  res.json({ success: true, data: entities });
});

export { router as productRoutes };
```

Register the route in `apps/api/src/index.ts`:

```typescript
import { productRoutes } from './modules/product/routes.js';

app.use('/api/v1/product', productRoutes);
```

## Step 3: Add React Features

Create a new feature in `apps/web/src/features/product/`:

```typescript
// apps/web/src/features/product/EntityList.tsx
export function EntityList({ workspaceId }: { workspaceId: string }) {
  // Fetch and display product entities
}
```

Add the route to `apps/web/src/App.tsx`:

```typescript
<Route path="/product/entities" element={<EntityList />} />
```

## Step 4: Configure Plan Features

Update the entitlement service in `apps/api/src/modules/entitlements/service.ts`:

```typescript
function getPlanFeatureAccess(planKey: string, featureKey: string): boolean {
  const planFeatures: Record<string, Record<string, boolean>> = {
    starter: { 'product.feature1': true },
    pro: { 'product.feature1': true, 'product.feature2': true },
    business: { 'product.feature1': true, 'product.feature2': true, 'product.feature3': true },
  };
  return planFeatures[planKey]?.[featureKey] ?? false;
}
```

## Step 5: Add Permissions

Extend the role system if needed by updating the membership middleware or creating new permission checks.

## Step 6: Add Seed Data

Update `packages/database/prisma/seed.ts` with product-specific seed data.

## Best Practices

1. **Keep modules isolated**: Product code should live in `modules/product/` and `features/product/`
2. **Use workspace scoping**: Always scope queries to the workspace ID
3. **Leverage existing auth**: Use the `requireAuth` and `requireWorkspaceMember` middleware
4. **Validate with Zod**: Add schemas to `packages/shared/src/schemas.ts`
5. **Use shared types**: Add types to `packages/shared/src/types.ts`
