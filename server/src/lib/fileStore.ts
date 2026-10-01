import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Zero-dependency JSON store with a Prisma-like delegate API
 * (findMany / findUnique / create / createMany / update / upsert / delete /
 * deleteMany / count). It backs the homepage CMS whenever Postgres is not
 * reachable so the site + admin work out of the box (`npm run dev`), and the
 * same data file can later be imported into Postgres.
 *
 * Data lives in server/data/homepage-cms.json (git-ignored). Writes are
 * atomic (temp file + rename) and debounced.
 */
export type Row = Record<string, any>;
export type Order = Record<string, "asc" | "desc">;

export interface FindManyArgs {
  where?: Row;
  orderBy?: Order | Order[];
  select?: Record<string, boolean>;
  take?: number;
  skip?: number;
}

export interface Delegate {
  findMany(args?: FindManyArgs): Promise<Row[]>;
  findFirst(args?: FindManyArgs): Promise<Row | null>;
  findUnique(args: { where: Row; select?: Record<string, boolean> }): Promise<Row | null>;
  create(args: { data: Row }): Promise<Row>;
  createMany(args: { data: Row[] }): Promise<{ count: number }>;
  update(args: { where: Row; data: Row }): Promise<Row>;
  upsert(args: { where: Row; update: Row; create: Row }): Promise<Row>;
  delete(args: { where: Row }): Promise<Row>;
  deleteMany(args?: { where?: Row }): Promise<{ count: number }>;
  count(args?: { where?: Row }): Promise<number>;
}

export const MODELS = [
  "intellect", "trip", "destination", "event", "testimonial", "galleryImage", "siteSetting", "aboutCard", "founder",
  "intellectPlacement", "experienceSite", "experienceFragment", "experienceQuestion",
  // round 8: destinations & itineraries, activity icons, media library, events page
  "itinerary", "activityIcon", "mediaAsset", "eventPrinciple",
] as const;
export type ModelName = (typeof MODELS)[number];

/** Per-model column defaults (mirrors prisma/schema.prisma). */
const DEFAULTS: Record<ModelName, Row> = {
  intellect: { status: "PUBLISHED", order: 0, published: true },
  trip: { status: "PUBLISHED", order: 0, published: true, primaryCtaText: "Experience with us", secondaryCtaText: "View Itinerary" },
  destination: { status: "DRAFT", order: 0, published: false, itineraries: 0 },
  event: {
    status: "DRAFT", visibility: "PUBLIC", published: false, order: 0, format: "ONLINE", category: "Knowledge Session",
    ctaText: "Know more", openRegistration: true, earlyBirdEnabled: false, reminderOneWeek: true, reminderOneDay: true,
    reminderOneHour: false, registrations: 0,
  },
  testimonial: { status: "PUBLISHED", order: 0, published: true },
  galleryImage: { status: "PUBLISHED", order: 0, published: true },
  siteSetting: {},
  aboutCard: { status: "PUBLISHED", order: 0, published: true },
  founder: { status: "PUBLISHED", order: 0, published: true },
  intellectPlacement: { status: "PUBLISHED", order: 0, published: true },
  experienceSite: { status: "PUBLISHED", order: 0, published: true, lensALabel: "Engineering", lensBLabel: "Cosmology", figure: "boulders" },
  experienceFragment: { status: "PUBLISHED", order: 0, published: true },
  experienceQuestion: { status: "PUBLISHED", order: 0, published: true },
  itinerary: { status: "DRAFT", order: 0, published: true, days: [], stays: [], iconOverrides: {} },
  activityIcon: { status: "PUBLISHED", order: 0, published: true },
  mediaAsset: { status: "PUBLISHED", order: 0, published: true, folder: "general", kind: "image", inBank: false, inFolderGallery: true },
  eventPrinciple: { status: "PUBLISHED", order: 0, published: true },
};

const ID_FIELD: Record<ModelName, string> = {
  intellect: "id", trip: "id", destination: "id", event: "id", testimonial: "id", galleryImage: "id", siteSetting: "key", aboutCard: "id", founder: "id",
  intellectPlacement: "id", experienceSite: "id", experienceFragment: "id", experienceQuestion: "id",
  itinerary: "id", activityIcon: "id", mediaAsset: "id", eventPrinciple: "id",
};

/** cuid-ish id (prefix c + 24 base36 chars) so ids look like the Postgres ones. */
export function cuid() {
  return "c" + crypto.randomBytes(16).toString("hex").slice(0, 24);
}

function matches(row: Row, where?: Row) {
  if (!where) return true;
  return Object.entries(where).every(([k, v]) => {
    if (v && typeof v === "object" && !(v instanceof Date)) {
      if ("in" in v) return (v.in as unknown[]).includes(row[k]);
      if ("not" in v) return row[k] !== v.not;
      if ("equals" in v) return row[k] === v.equals;
      if ("startsWith" in v) return typeof row[k] === "string" && row[k].startsWith(v.startsWith);
      if ("gte" in v) return row[k] !== null && row[k] !== undefined && row[k] >= v.gte;
      if ("lt" in v) return row[k] !== null && row[k] !== undefined && row[k] < v.lt;
    }
    return row[k] === v;
  });
}

function sortRows(rows: Row[], orderBy?: Order | Order[]) {
  if (!orderBy) return rows;
  const orders = (Array.isArray(orderBy) ? orderBy : [orderBy]).flatMap((o) => Object.entries(o));
  return [...rows].sort((a, b) => {
    for (const [field, dir] of orders) {
      const av = a[field], bv = b[field];
      if (av === bv) continue;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const c = av < bv ? -1 : 1;
      return dir === "desc" ? -c : c;
    }
    return 0;
  });
}

function pick(row: Row, select?: Record<string, boolean>) {
  if (!select) return { ...row };
  return Object.fromEntries(Object.entries(select).filter(([, on]) => on).map(([k]) => [k, row[k]]));
}

function revive(row: Row) {
  // ISO strings for known Date columns → Date (so JSON output matches Prisma)
  for (const k of ["createdAt", "updatedAt", "eventDate", "earlyBirdDeadline"]) {
    if (typeof row[k] === "string" && /^\d{4}-\d{2}-\d{2}T/.test(row[k])) row[k] = new Date(row[k]);
  }
  return row;
}

export class FileStore {
  readonly file: string;
  private data: Record<ModelName, Row[]>;
  private timer: NodeJS.Timeout | null = null;
  readonly isNew: boolean;

  constructor(file: string) {
    this.file = file;
    let loaded: Partial<Record<ModelName, Row[]>> = {};
    this.isNew = !fs.existsSync(file);
    if (!this.isNew) {
      try {
        loaded = JSON.parse(fs.readFileSync(file, "utf8"));
      } catch (e) {
        console.error(`[store] ${file} is not valid JSON — starting from an empty store.`, e);
        loaded = {};
      }
    }
    this.data = Object.fromEntries(MODELS.map((m) => [m, (loaded[m] ?? []).map(revive)])) as Record<ModelName, Row[]>;
  }

  /** Persist soon (debounced) — atomic write. */
  private schedule() {
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.flush();
    }, 50);
  }

  flush() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
    fs.renameSync(tmp, this.file);
  }

  delegate(model: ModelName): Delegate {
    const rows = () => this.data[model];
    const idField = ID_FIELD[model];
    const now = () => new Date();

    const findMany = async (args: FindManyArgs = {}) => {
      let out = sortRows(rows().filter((r) => matches(r, args.where)), args.orderBy);
      if (args.skip) out = out.slice(args.skip);
      if (args.take !== undefined) out = out.slice(0, args.take);
      return out.map((r) => pick(r, args.select));
    };
    const findUnique = async (args: { where: Row; select?: Record<string, boolean> }) => {
      const r = rows().find((x) => matches(x, args.where));
      return r ? pick(r, args.select) : null;
    };
    const create = async (args: { data: Row }) => {
      const row: Row = { ...DEFAULTS[model], ...args.data };
      if (!row[idField]) row[idField] = cuid();
      if (model !== "siteSetting" && !row.createdAt) row.createdAt = now();
      row.updatedAt = now();
      rows().push(row);
      this.schedule();
      return { ...row };
    };
    const update = async (args: { where: Row; data: Row }) => {
      const r = rows().find((x) => matches(x, args.where));
      if (!r) throw new Error(`[store] ${model}: record not found`);
      Object.assign(r, args.data, { updatedAt: now() });
      this.schedule();
      return { ...r };
    };

    return {
      findMany,
      findFirst: async (args = {}) => (await findMany({ ...args, take: 1 }))[0] ?? null,
      findUnique,
      create,
      createMany: async ({ data }) => {
        for (const d of data) await create({ data: d });
        return { count: data.length };
      },
      update,
      upsert: async ({ where, update: u, create: c }) =>
        (rows().some((x) => matches(x, where)) ? update({ where, data: u }) : create({ data: { ...where, ...c } })),
      delete: async ({ where }) => {
        const i = rows().findIndex((x) => matches(x, where));
        if (i < 0) throw new Error(`[store] ${model}: record not found`);
        const [r] = rows().splice(i, 1);
        this.schedule();
        return r;
      },
      deleteMany: async (args = {}) => {
        const before = rows().length;
        this.data[model] = rows().filter((r) => !matches(r, args.where));
        this.schedule();
        return { count: before - rows().length };
      },
      count: async (args = {}) => rows().filter((r) => matches(r, args.where)).length,
    };
  }
}
