import "dotenv/config";
import path from "node:path";

/**
 * Prisma client, loaded defensively: if `prisma generate` has not been run
 * (no ../../generated/prisma/client) or DATABASE_URL is missing, importing this
 * module no longer crashes the whole API. `prismaAvailable` tells callers
 * whether the real client exists; every access on the fallback proxy throws a
 * clear message. The homepage CMS uses ./db instead, which falls back to a
 * local file store automatically.
 */
let client: any = null;
let loadError: Error | null = null;

try {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require(path.join(__dirname, "../../generated/prisma/client"));
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg");
  client = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
} catch (e) {
  loadError = e as Error;
}

export const prismaAvailable = !!client;
export const prismaLoadError = loadError;

const prisma: any =
  client ??
  new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === "then") return undefined;
        throw new Error(
          `Prisma is not available (${loadError?.message}). Set DATABASE_URL in server/.env and run "npm run generate && npm run migrate", ` +
            `or keep using the built-in file store for the homepage CMS.`
        );
      },
    }
  );

export default prisma;
