# Adding Product Database Models

This guide explains how to add product-specific database models.

## Location

Add product models to `packages/database/prisma/schema.prisma` in the designated section:

```prisma
// ─── Product Module Placeholder ──────────────────────────────────────────────
// Future product-specific models should be added here.
```

## Example

```prisma
model project {
  id          String    @id @default(cuid())
  workspaceId String
  workspace   workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  name        String
  description String?
  status      String    @default("active")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([workspaceId])
  @@map("projects")
}
```

## Best Practices

1. **Always include workspaceId**: Scope all product models to a workspace
2. **Add indexes**: Index foreign keys and frequently queried fields
3. **Use timestamps**: Include `createdAt` and `updatedAt`
4. **Use Map directive**: Use `@@map()` for snake_case table names
5. **Cascade deletes**: Use `onDelete: Cascade` for workspace-owned data

## Regenerating Client

After adding models:

```bash
pnpm db:generate
pnpm db:push
```

## Updating Seed Data

Update `packages/database/prisma/seed.ts` to include seed data for new models.
