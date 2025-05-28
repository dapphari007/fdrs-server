import { AppDataSource } from "../config/database";
import logger from "../utils/logger";

/**
 * Script to run migrations in the correct order
 * Run with: npx ts-node src/scripts/run-migrations.ts
 */
async function runMigrations() {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info("Database connection initialized");
    }

    // Get all migration files
    const migrationFiles = AppDataSource.migrations;
    
    // Sort migrations by timestamp (extracted from class name)
    migrationFiles.sort((a, b) => {
      const timestampA = extractTimestamp(a.name);
      const timestampB = extractTimestamp(b.name);
      return timestampA - timestampB;
    });
    
    logger.info(`Found ${migrationFiles.length} migration files, running in order:`);
    
    // Run migrations one by one in order
    for (const migration of migrationFiles) {
      try {
        if (!migration.name) {
          logger.warn(`Skipping migration with undefined name`);
          continue;
        }
        
        logger.info(`Running migration: ${migration.name}`);
        
        const queryRunner = AppDataSource.createQueryRunner();
        await migration.up(queryRunner);
        
        // Record the migration in the migrations table
        try {
          await queryRunner.query(
            `INSERT INTO migrations(timestamp, name) VALUES($1, $2) ON CONFLICT DO NOTHING`,
            [extractTimestamp(migration.name), migration.name]
          );
        } catch (recordError) {
          logger.warn(`Could not record migration ${migration.name} in migrations table:`, recordError);
        }
        
        await queryRunner.release();
        logger.info(`Successfully ran migration: ${migration.name}`);
      } catch (error) {
        logger.error(`Error running migration ${migration.name}:`, error);
      }
    }
    
    logger.info("Migration process completed");
    
    await AppDataSource.destroy();
    
  } catch (error) {
    logger.error("Error running migrations:", error);
  }
}

// Helper function to extract timestamp from migration class name
function extractTimestamp(className: string): number {
  if (!className) return 0;
  
  // Try to extract a number that looks like a timestamp
  const match = className.match(/(\d{13,})/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return 0;
}

// Run the function
runMigrations().catch(error => {
  logger.error("Unhandled error:", error);
  process.exit(1);
});