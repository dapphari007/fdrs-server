# Migration Fixes

This document provides instructions for fixing migration issues in the FDRS application.

## Common Migration Errors

1. **Syntax error at or near "["**
   - This is typically caused by PostgreSQL not properly handling JSON/JSONB data types in migrations
   - Fixed by modifying the column type and format in the migration files

2. **Invalid migration name found**
   - Caused by corrupted entries in the migrations table
   - Fixed by cleaning up the migrations table

3. **null value in column "name" of relation "migrations" violates not-null constraint**
   - Caused by migrations being recorded without a name
   - Fixed by removing null entries from the migrations table

## How to Fix Migration Issues

### Option 1: Use the Repair Script

We've added a repair script that automates the fix process:

```bash
# Run the migration repair process
npm run db:repair
```

This script will:
1. Fix the migrations table by removing null entries and duplicates
2. Run all migrations in the correct order

### Option 2: Manual Fix

If the automated repair doesn't work, you can fix the issues manually:

1. First, fix the migrations table:
```bash
npm run fix:migrations
```

2. Then run the migrations in order:
```bash
npm run run:migrations
```

### Option 3: Reset the Database (Development Only)

If you're in development and don't mind losing data, you can reset the database:

```bash
npm run db:reset
```

## Preventing Future Issues

To prevent these issues in the future:

1. Always use proper JSON/JSONB handling in migrations
2. Use the TypeORM CLI to generate migrations
3. Test migrations thoroughly before deploying
4. Keep backups of your database

## Modified Files

The following files were modified to fix the migration issues:

1. `server/src/migrations/1720000000000-CreateWorkflowLevelsTable.ts`
   - Changed the column type for `fallback_roles` from `jsonb` to `text`
   - Removed the `::jsonb` cast from the INSERT statements

2. `server/src/config/database.ts`
   - Improved error handling for migrations
   - Added code to fix the migrations table before running migrations

3. Added new utility scripts:
   - `server/src/scripts/fix-migrations.ts`
   - `server/src/scripts/run-migrations.ts`

4. Added new npm scripts in `package.json`:
   - `fix:migrations`
   - `run:migrations`
   - `db:repair`