# Automatic Migration Fixes

This document explains how migration issues are automatically fixed when the server starts.

## How Automatic Migration Fixes Work

The FDRS application now includes automatic migration fixes that run during server startup. These fixes address common issues with the migrations table and ensure that migrations run smoothly.

### What Gets Fixed Automatically

When the server starts, the following migration issues are automatically fixed:

1. **Null Migration Names**
   - The system checks for and removes any entries in the migrations table with null names
   - This prevents the "null value in column 'name' violates not-null constraint" error

2. **Duplicate Migration Entries**
   - The system identifies and removes duplicate migration entries, keeping only the latest one
   - This prevents conflicts when running migrations

3. **Syntax Errors in JSON/JSONB Fields**
   - The `CreateWorkflowLevelsTable` migration has been fixed to properly handle JSON data
   - This prevents the "syntax error at or near '['" error

### How It Works

The automatic fix process is integrated into the server startup sequence:

1. During server initialization, the `runMigrations` function is called
2. This function first checks and fixes the migrations table before running any pending migrations
3. After fixing the table, it runs any pending migrations in the correct order
4. If any migration fails, it attempts to run migrations individually to isolate the problem

## Manual Fixes (If Needed)

If the automatic fixes don't resolve all issues, you can still run the manual fix scripts:

```bash
# Fix the migrations table
npm run fix:migrations

# Run migrations in the correct order
npm run run:migrations

# Or run both in sequence
npm run db:repair
```

## Modified Files

The following files were updated to implement automatic migration fixes:

1. `server/src/scripts/runMigrations.ts`
   - Added code to fix the migrations table before running migrations

2. `server/src/server.ts`
   - Updated to use the improved runMigrations function
   - Simplified the migration process

3. `server/src/migrations/1720000000000-CreateWorkflowLevelsTable.ts`
   - Fixed JSON handling to prevent syntax errors

## Troubleshooting

If you still encounter migration issues after the automatic fixes:

1. Check the server logs for specific error messages
2. Run the manual fix scripts mentioned above
3. If problems persist, you may need to manually fix specific migrations or the database schema