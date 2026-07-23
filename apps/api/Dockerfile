FROM node:20-alpine AS base
RUN npm install -g pnpm@9.15.4

# ─── Dependencies ───────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/config/package.json ./packages/config/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

# ─── Build ─────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN pnpm --filter @saas/database generate
RUN pnpm --filter @saas/config build
RUN pnpm --filter @saas/database build
RUN pnpm --filter @saas/shared build
RUN pnpm --filter @saas/api build

# ─── Production ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Workspace config
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Workspace package manifests (update main to dist)
COPY --from=builder /app/packages/config/package.json ./packages/config/package.json
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Built workspace packages
COPY --from=builder /app/packages/config/dist ./packages/config/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Production node_modules
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm

# Workspace package symlinks (so Node resolves @saas/* correctly)
COPY --from=builder /app/node_modules/@saas ./node_modules/@saas

# Prisma CLI (for schema push on startup)
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Fix main fields: point to dist instead of src for production
RUN sed -i 's|"main": "src/index.ts"|"main": "dist/index.js"|g' \
    packages/config/package.json \
    packages/database/package.json \
    packages/shared/package.json

# Startup script
COPY apps/api/start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 10000
CMD ["./start.sh"]
