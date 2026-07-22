# Adding Product Seed Data

This guide explains how to add product-specific seed data.

## Location

Update `packages/database/prisma/seed.ts` with your seed data.

## Example

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Test Workspace',
      slug: 'test-workspace',
      ownerId: 'test-user-id',
    },
  });

  // Create product-specific data
  await prisma.project.createMany({
    data: [
      { workspaceId: workspace.id, name: 'Project 1' },
      { workspaceId: workspace.id, name: 'Project 2' },
    ],
  });

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Running Seeds

```bash
pnpm db:seed
```

## Best Practices

1. **Use createMany**: For bulk inserts, use `createMany` for better performance
2. **Handle duplicates**: Use `upsert` or check for existing records
3. **Use transactions**: Wrap related inserts in a transaction
4. **Clear existing data**: Optionally clear existing data before seeding
5. **Use realistic data**: Generate realistic test data
