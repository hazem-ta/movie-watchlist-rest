// Runtime entry point (Prisma 8 db.ts equivalent, in JS).
// See node_modules/@prisma/orm-postgres/skills/prisma-8/references/runtime.md
import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import contractJson from './contract.json' with { type: 'json' };

export const contract = contractFromJson(contractJson);

// Constructed once at module scope; the pool lives for the process lifetime.
// Connecting is lazy — the first database connection opens on the first query.
export const db = postgres({
  contract,
  url: process.env['DATABASE_URL'],
  log: {
    info: console.log,
    warn: console.warn,
    error: console.error,
  },
});
