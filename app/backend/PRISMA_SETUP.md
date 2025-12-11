# Prisma 7 Setup Guide

## ✅ What Was Fixed

### 1. **Schema Configuration** (`prisma/schema.prisma`)
**Problem:** Prisma 7 no longer supports the `url` property in the datasource block.

**Before:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ❌ Not supported in Prisma 7
}
```

**After:**
```prisma
datasource db {
  provider = "postgresql"  // ✅ URL moved to prisma.config.ts
}
```

### 2. **Configuration File** (`prisma.config.ts`)
The database URL is now configured here:

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),  // ✅ URL configuration
  },
});
```

### 3. **Database Connection** (`src/lib/prisma.ts`)
Created a proper Prisma Client setup with PostgreSQL adapter:

```typescript
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export default prisma;
```

## 📦 Installed Dependencies

```bash
# Production dependencies
bun add @prisma/adapter-pg pg

# Development dependencies
bun add -D @types/pg dotenv
```

## 🚀 Usage

### Import and use Prisma Client:

```typescript
import prisma from "./src/lib/prisma";

// Example: Create a patient
const patient = await prisma.patient.create({
  data: {
    email: "patient@example.com",
    name: "John Doe",
    authProvider: "GOOGLE",
  },
});

// Example: Find patients
const patients = await prisma.patient.findMany();

// Example: Count records
const count = await prisma.patient.count();
```

## 🔧 Common Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a migration
npx prisma migrate dev --name your_migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

## 📝 Database Schema

Current schema includes:

```prisma
model Patient {
  id             String       @id @default(uuid())
  googleId       String?      @unique
  email          String       @unique
  name           String?
  password       String?
  authProvider   AuthProvider @default(GOOGLE)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

enum AuthProvider {
  GOOGLE
  CREDENTIALS
}
```

## ✨ Key Differences from Prisma 6

1. **No `url` in schema.prisma** - Moved to `prisma.config.ts`
2. **Adapter required** - Use `@prisma/adapter-pg` for PostgreSQL
3. **PrismaClient configuration** - Pass adapter in constructor

## 🔗 Useful Links

- [Prisma 7 Configuration Docs](https://pris.ly/d/prisma7-client-config)
- [PostgreSQL Adapter](https://pris.ly/d/adapter-pg)
- [Migration Guide](https://pris.ly/d/prisma7-upgrade)
