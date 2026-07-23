#!/bin/sh
set -e

echo "🔄 Running Prisma schema push..."
./node_modules/.bin/prisma db push --schema=packages/database/prisma/schema.prisma --accept-data-loss

echo "🚀 Starting API server..."
node apps/api/dist/index.js
