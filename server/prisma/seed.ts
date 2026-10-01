/**
 * Seeds the homepage CMS with the placeholder content from the Figma.
 *   npm run seed            — fills only empty collections (safe to re-run)
 *   npm run seed -- --force — replaces the homepage collections
 * Works against Postgres (DATABASE_URL) or the local file store (STORAGE=file / no DATABASE_URL).
 */
import "dotenv/config";
import { getDb } from "../src/lib/db";
import { seedHomepage } from "../src/lib/seedData";
import { seedSite } from "../src/lib/seedSite";

getDb()
  .then(async (db) => {
    await seedHomepage(db as any, { force: process.argv.includes("--force") });
    await seedSite(db as any, { force: process.argv.includes("--force") });
    console.log(`Seeded homepage CMS content (${db.detail}).`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
