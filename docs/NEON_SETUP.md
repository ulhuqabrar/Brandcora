# Neon Database Setup

## Creating a Neon Project

1. Go to https://neon.tech
2. Sign up or log in
3. Create a new project
4. Copy the connection strings

## Connection Strings

Neon provides two connection strings:

- **Pooled connection** (`DATABASE_URL`): For application queries (uses connection pooling)
- **Direct connection** (`DIRECT_URL`): For Prisma migrations (bypasses connection pooler)

## Configuration

Add to your `.env`:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

## SSL Mode

Neon requires SSL connections. The `?sslmode=require` parameter ensures this.

## Connection Pooling

Neon uses PgBouncer for connection pooling. The pooled connection is recommended for:
- Application queries
- High-concurrency scenarios
- Serverless deployments

Use the direct connection for:
- Prisma migrations
- Schema changes
- Database administration

## Free Tier Limits

- 0.5 GB storage
- 24/7 compute (starter)
- 100 hours/month compute (free)

## Production Recommendations

- Upgrade to a paid plan for production
- Use connection pooling for application queries
- Monitor connection usage in the Neon dashboard
