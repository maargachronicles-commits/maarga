import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

/* ============================================================
   TYPES
============================================================ */

type CmsData = {
  journeys: unknown[];
  destinations: unknown[];
  destinationContents: unknown[];
};


/* ============================================================
   DATA FILE
============================================================ */

const dataDirectory =
  path.join(
    process.cwd(),
    "data"
  );

const dataFile =
  path.join(
    dataDirectory,
    "cms-public.json"
  );


/* ============================================================
   EMPTY DATA
============================================================ */

const EMPTY_DATA: CmsData = {
  journeys: [],
  destinations: [],
  destinationContents: [],
};


/* ============================================================
   READ DATA
============================================================ */

async function readCmsData(): Promise<CmsData> {
  try {
    const file =
      await fs.readFile(
        dataFile,
        "utf8"
      );

    const parsed =
      JSON.parse(file);

    return {
      journeys:
        Array.isArray(
          parsed?.journeys
        )
          ? parsed.journeys
          : [],

      destinations:
        Array.isArray(
          parsed?.destinations
        )
          ? parsed.destinations
          : [],

      destinationContents:
        Array.isArray(
          parsed?.destinationContents
        )
          ? parsed.destinationContents
          : [],
    };
  } catch (error) {

    const code =
      (
        error as NodeJS.ErrnoException
      ).code;

    if (code === "ENOENT") {
      return EMPTY_DATA;
    }

    console.error(
      "Failed to read CMS data:",
      error
    );

    return EMPTY_DATA;
  }
}


/* ============================================================
   WRITE DATA
============================================================ */

async function writeCmsData(
  data: CmsData
): Promise<void> {
  await fs.mkdir(
    dataDirectory,
    {
      recursive: true,
    }
  );

  await fs.writeFile(
    dataFile,
    JSON.stringify(
      data,
      null,
      2
    ),
    "utf8"
  );
}


/* ============================================================
   PUBLIC FILTER
============================================================ */

function getPublicData(
  data: CmsData
): CmsData {

  /*
   * Only published + visible journeys.
   */
  const journeys =
    data.journeys.filter(
      (journey: any) =>
        journey?.status ===
          "PUBLISHED" &&
        journey?.showOnWebsite ===
          true
    );


  /*
   * Only visible destinations.
   */
  const destinations =
    data.destinations.filter(
      (destination: any) =>
        destination?.showOnWebsite ===
        true
    );


  /*
   * IDs we are allowed to expose.
   */
  const journeyIds =
    new Set(
      journeys.map(
        (journey: any) =>
          journey.id
      )
    );


  const destinationIds =
    new Set(
      destinations.map(
        (destination: any) =>
          destination.id
      )
    );


  /*
   * Keep only relationships where
   * BOTH sides are publicly visible.
   */
  const destinationContents =
    data.destinationContents.filter(
      (content: any) =>
        journeyIds.has(
          content?.journeyId
        ) &&
        destinationIds.has(
          content?.destinationId
        )
    );


  return {
    journeys,

    destinations,

    destinationContents,
  };
}


/* ============================================================
   GET
============================================================ */

export async function GET() {
  try {

    const data =
      await readCmsData();

    const publicData =
      getPublicData(
        data
      );

    return NextResponse.json(
      publicData,
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store",

          "Access-Control-Allow-Origin":
            "*",
        },
      }
    );

  } catch (error) {

    console.error(
      "Homepage API GET error:",
      error
    );

    return NextResponse.json(
      {
        journeys: [],
        destinations: [],
        destinationContents: [],

        error:
          "Failed to load homepage data.",
      },
      {
        status: 500,
      }
    );
  }
}


/* ============================================================
   POST
============================================================ */

export async function POST(
  request: Request
) {
  try {

    const body =
      await request.json();


    /*
     * Validate the incoming arrays.
     */
    const data: CmsData = {
      journeys:
        Array.isArray(
          body?.journeys
        )
          ? body.journeys
          : [],

      destinations:
        Array.isArray(
          body?.destinations
        )
          ? body.destinations
          : [],

      destinationContents:
        Array.isArray(
          body?.destinationContents
        )
          ? body.destinationContents
          : [],
    };


    /*
     * Save the complete CMS snapshot
     * to the Admin server.
     */
    await writeCmsData(
      data
    );


    /*
     * Return what the public site is
     * actually allowed to see.
     */
    const publicData =
      getPublicData(
        data
      );


    return NextResponse.json(
      {
        success: true,

        ...publicData,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store",

          "Access-Control-Allow-Origin":
            "*",
        },
      }
    );

  } catch (error) {

    console.error(
      "Homepage API POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Failed to save homepage CMS data.",
      },
      {
        status: 500,
      }
    );
  }
}


/* ============================================================
   OPTIONS
============================================================ */

export async function OPTIONS() {
  return new NextResponse(
    null,
    {
      status: 204,

      headers: {
        "Access-Control-Allow-Origin":
          "*",

        "Access-Control-Allow-Methods":
          "GET, POST, OPTIONS",

        "Access-Control-Allow-Headers":
          "Content-Type",
      },
    }
  );
}