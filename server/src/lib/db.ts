import path from "node:path";
import { FileStore, MODELS, type Delegate, type ModelName } from "./fileStore";
import { seedAbout, seedExperience, seedHomepage } from "./seedData";
import { seedSite } from "./seedSite";
import type * as PrismaModule from "./prisma";

/**
 * Single data-access entry point for the homepage CMS routes.
 *
 *  - If DATABASE_URL is set, the generated Prisma client exists and Postgres
 *    answers within a few seconds → Prisma is used ("postgres").
 *  - Otherwise → the JSON file store in server/data/homepage-cms.json ("file"),
 *    seeded with the Figma placeholder content on first start. No database,
 *    no Cloudinary, no `prisma generate` needed: `npm run dev` just works.
 *
 * Set STORAGE=file to force the file store, STORAGE=postgres to refuse to
 * fall back (the API then exits with the connection error).
 *
 * The exported `db` is a lazy proxy so route modules can import it
 * synchronously; the backend is resolved on the first query.
 */
export type Db = Record<ModelName, Delegate> & { mode: "postgres" | "file"; detail: string };

let backendPromise: Promise<Db> | null = null;

export const DATA_FILE = path.resolve(__dirname, "../../data/homepage-cms.json");

async function connectPrisma(): Promise<Db> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("./prisma") as typeof PrismaModule;
  if (!mod.prismaAvailable) throw mod.prismaLoadError ?? new Error("Prisma client unavailable");
  const prisma = mod.default as any;
  await Promise.race([
    prisma.$queryRaw`SELECT 1`,
    new Promise((_, rej) => setTimeout(() => rej(new Error("Postgres did not answer within 4 s")), 4000)),
  ]);
  const db = { mode: "postgres", detail: "Postgres via Prisma" } as Db;
  for (const m of MODELS) (db as any)[m] = prisma[m];
  return db;
}

function fileBackend(reason: string): Promise<Db> {
  const store = new FileStore(DATA_FILE);
  const db = { mode: "file", detail: `Local file store (${path.relative(process.cwd(), DATA_FILE)})` } as Db;
  for (const m of MODELS) (db as any)[m] = store.delegate(m);
  // new store → full placeholder content; existing store → only sections that did not exist yet (About page)
  const ready = (store.isNew ? seedHomepage(db) : seedAbout(db).then(() => seedExperience(db))).then(() => seedSite(db)).then(() => store.flush());
  return ready.then(() => {
    console.log(`[maarga] ${reason}`);
    console.log(`[maarga] Using the local file store: ${DATA_FILE}${store.isNew ? " (created + seeded with the Figma placeholder content)" : ""}`);
    return db;
  });
}

export function getDb(): Promise<Db> {
  if (backendPromise) return backendPromise;
  const pref = (process.env.STORAGE || "auto").toLowerCase();
  backendPromise = (async () => {
    if (pref === "file") return fileBackend("STORAGE=file");
    if (!process.env.DATABASE_URL) {
      if (pref === "postgres") throw new Error("STORAGE=postgres but DATABASE_URL is not set");
      return fileBackend("DATABASE_URL is not set.");
    }
    try {
      const db = await connectPrisma();
      console.log("[maarga] Connected to Postgres via Prisma.");
      return db;
    } catch (e) {
      const msg = (e as Error).message?.split("\n")[0] ?? String(e);
      if (pref === "postgres") throw e;
      return fileBackend(`Postgres unavailable (${msg}) — falling back.`);
    }
  })();
  backendPromise.catch(() => {
    backendPromise = null;
  });
  return backendPromise;
}

/** Lazy proxy: `db.trip.findMany(...)` resolves the backend first. */
export const db: Db = new Proxy({} as Db, {
  get(_t, prop: string) {
    if (prop === "mode" || prop === "detail") return undefined;
    if (!(MODELS as readonly string[]).includes(prop)) return undefined;
    return new Proxy({} as Delegate, {
      get(_d, method: string) {
        return async (...args: unknown[]) => {
          const b = await getDb();
          return (b as any)[prop][method](...args);
        };
      },
    });
  },
});

export default db;
