/* ============================================================
   SCHOLARS
   ============================================================ */

export type Scholar = {
  id: string;
  name: string;
  credential: string;

  group:
    | "Founder / Core Scholar"
    | "Network Scholar";

  status:
    | "Published"
    | "Draft";

  showOnWebsite: boolean;

  biography: string;
  highlights: string[];
  tags: string[];
  portrait: string;
};


/* ============================================================
   EVENTS
   ============================================================ */

export type EventRecord = {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  format: string;
  scholarId: string;
  attendees: number;

  status:
    | "PUBLISHED"
    | "DRAFT";

  showOnWebsite: boolean;

  summary: string;
  testimonialQuote: string;
  testimonialName: string;
  testimonialOrganisation: string;

  photos: string[];

  createdAt: string;
  updatedAt: string;
};


/* ============================================================
   TESTIMONIALS
   ============================================================ */

export type TestimonialStatus =
  | "PENDING_REVIEW"
  | "APPROVED";

export type Testimonial = {
  id: string;

  quote: string;
  travellerName: string;
  titleOrganisation: string;
  linkedItem: string;

  status: TestimonialStatus;

  showOnWebsite: boolean;

  createdAt: string;
  updatedAt: string;
};


/* ============================================================
   DESTINATIONS
   ============================================================ */

export type Destination = {
  id: string;

  name: string;
  region: string;
  country: string;

  description: string;

  coverImage: string;

  showOnWebsite: boolean;

  createdAt: string;
  updatedAt: string;
};


/* ============================================================
   JOURNEYS
   ------------------------------------------------------------
   JOURNEY = BOOKABLE PRODUCT
   ------------------------------------------------------------
   No destinationId here.
   A Journey can contain multiple destinations through
   DestinationContent.
   ============================================================ */

export type JourneyStatus =
  | "PUBLISHED"
  | "DRAFT";

export type Journey = {
  id: string;

  title: string;

  startDate: string;
  endDate: string;

  duration: string;

  coverImage: string;

  standardPrice: number;

  earlyBirdEnabled: boolean;
  earlyBirdPrice: number;
  earlyBirdDeadline: string;

  groupSizeLimit: number;
  currentRegistrations: number;

  status: JourneyStatus;

  showOnWebsite: boolean;

  createdAt: string;
  updatedAt: string;
};


/* ============================================================
   ITINERARY
   ============================================================ */

export type ItineraryStopType =
  | "Walking"
  | "Temple / Monument"
  | "Boat"
  | "Seminar"
  | "Meal"
  | "Transfer"
  | "Viewpoint"
  | "Performance"
  | "Workshop";

  /* ============================================================
   ACTIVITY ICON LIBRARY
   ============================================================ */

export type ActivityIcon = {
  id: string;

  name: string;

  slug: string;

  description: string;

  image: string;

  showOnWebsite: boolean;

  createdAt: string;

  updatedAt: string;
};

export type ItineraryStop = {
  id: string;

  type: ItineraryStopType;

  title: string;

  description: string;

  order: number;
};

export type ItineraryDay = {
  id: string;

  dayNumber: number;

  title: string;

  coverImage: string;

  stops: ItineraryStop[];
};


/* ============================================================
   STAY
   ============================================================ */

export type Accommodation = {
  id: string;

  name: string;

  description: string;

  image: string;

  tags: string[];

  destinationSpecificNote: string;
};


/* ============================================================
   DESTINATION + JOURNEY CONTENT
   ------------------------------------------------------------
   One record represents:
   Destination + Journey + Itinerary + Stay
   ============================================================ */

export type DestinationContent = {
  id: string;

  destinationId: string;

  journeyId: string;

  days: ItineraryDay[];

  accommodations: Accommodation[];

  createdAt: string;
  updatedAt: string;
};


/* ============================================================
   STORAGE
   ============================================================ */

const SCHOLARS_KEY =
  "maarga_scholars";

const EVENTS_KEY =
  "maarga_events";

const TESTIMONIALS_KEY =
  "maarga_testimonials";

const JOURNEYS_KEY =
  "maarga_journeys";

const DESTINATIONS_KEY =
  "maarga_destinations";

const DESTINATION_CONTENT_KEY =
  "maarga_destination_content";

const HOMEPAGE_CURATION_KEY =
  "maarga_homepage_curation";

const ACTIVITY_ICONS_KEY =
  "maarga_activity_icons";



/* ============================================================
   PUBLIC WEBSITE SYNC
   ------------------------------------------------------------
   This is completely separate from Admin storage.
   
   Admin still uses:
     localStorage

   Public website uses:
     /api/public/homepage

   A sync failure MUST NEVER stop the Admin from
   saving, loading, editing, or displaying data.
   ============================================================ */

const PUBLIC_CMS_SYNC_URL =
  "/admin/api/public/homepage";

let publicCmsSyncTimer:
  ReturnType<typeof setTimeout> | null =
    null;

let publicCmsSyncRunning =
  false;

let publicCmsSyncAgain =
  false;


/* ============================================================
   PUBLIC CMS SNAPSHOT
============================================================ */

function buildPublicCmsSnapshot() {
  return {
    /*
     * Read the CURRENT Admin localStorage
     * values at the moment of syncing.
     */
    journeys:
      getJourneys(),

    destinations:
      getDestinations(),

    destinationContents:
      getDestinationContents(),
  };
}


/* ============================================================
   PUBLIC CMS SYNC
============================================================ */

export function syncPublicCms(): void {
  /*
   * Never execute on the server.
   *
   * The Admin CMS is browser/localStorage based.
   */
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }


  /*
   * Debounce rapid saves.
   *
   * Example:
   *
   * Save Journey
   * Save Destination
   * Save DestinationContent
   *
   * within a few milliseconds.
   *
   * We only need one final sync.
   */
  if (
    publicCmsSyncTimer !== null
  ) {
    clearTimeout(
      publicCmsSyncTimer
    );
  }


  publicCmsSyncTimer =
    setTimeout(
      () => {
        publicCmsSyncTimer =
          null;

        void performPublicCmsSync();
      },
      100
    );
}


/* ============================================================
   PERFORM SYNC
============================================================ */

async function performPublicCmsSync(): Promise<void> {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }


  /*
   * Do not run two POST requests at the
   * same time.
   */
  if (
    publicCmsSyncRunning
  ) {
    publicCmsSyncAgain =
      true;

    return;
  }


  publicCmsSyncRunning =
    true;


  try {

    const payload =
      buildPublicCmsSnapshot();


    console.log(
      "[MAARGA CMS] Preparing public sync",
      {
        journeys:
          payload.journeys.length,

        destinations:
          payload.destinations.length,

        destinationContents:
          payload
            .destinationContents
            .length,
      }
    );


    /*
     * Explicitly use the Admin app's
     * current origin.
     *
     * This prevents accidental requests
     * to another origin if the Admin
     * configuration changes later.
     */
    const url =
      new URL(
        PUBLIC_CMS_SYNC_URL,
        window.location.origin
      );


    const response =
      await fetch(
        url.toString(),
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          /*
           * Do not cache a CMS sync.
           */
          cache:
            "no-store",

          /*
           * Send the COMPLETE current
           * Admin snapshot.
           */
          body:
            JSON.stringify(
              payload
            ),
        }
      );


    if (!response.ok) {

      const errorText =
        await response
          .text()
          .catch(
            () => ""
          );


      console.error(
        "[MAARGA CMS] Public sync failed",
        {
          status:
            response.status,

          response:
            errorText,
        }
      );


      /*
       * IMPORTANT:
       *
       * We deliberately do NOT throw.
       *
       * The Admin must continue working
       * even when the public sync fails.
       */
      return;
    }


    const result =
      await response
        .json()
        .catch(
          () => null
        );


    console.log(
      "[MAARGA CMS] Public sync complete",
      {
        journeys:
          result?.journeys
            ?.length ??
          payload.journeys.length,

        destinations:
          result?.destinations
            ?.length ??
          payload.destinations.length,

        destinationContents:
          result
            ?.destinationContents
            ?.length ??
          payload
            .destinationContents
            .length,
      }
    );

  } catch (error) {

    /*
     * NEVER allow the public website
     * connection to break Admin.
     */
    console.error(
      "[MAARGA CMS] Public sync error:",
      error
    );

  } finally {

    publicCmsSyncRunning =
      false;


    /*
     * If another save happened while
     * the previous request was running,
     * sync the latest state once more.
     */
    if (
      publicCmsSyncAgain
    ) {
      publicCmsSyncAgain =
        false;

      syncPublicCms();
    }
  }
}
/* ============================================================
   SCHOLARS
   ============================================================ */

export function getScholars(): Scholar[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored =
      localStorage.getItem(
        SCHOLARS_KEY
      );

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(
      (item: Partial<Scholar>) => ({
        id: item.id ?? "",
        name: item.name ?? "",
        credential: item.credential ?? "",

        group:
          item.group === "Network Scholar"
            ? "Network Scholar"
            : "Founder / Core Scholar",

        status:
          item.status === "Draft"
            ? "Draft"
            : "Published",

        showOnWebsite:
          item.showOnWebsite ?? true,

        biography:
          item.biography ?? "",

        highlights:
          Array.isArray(item.highlights)
            ? item.highlights
            : [],

        tags:
          Array.isArray(item.tags)
            ? item.tags
            : [],

        portrait:
          item.portrait ?? "",
      })
    );
  } catch {
    return [];
  }
}

export function saveScholars(
  scholars: Scholar[]
): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    SCHOLARS_KEY,
    JSON.stringify(scholars)
  );
}


/* ============================================================
   EVENTS
   ============================================================ */

export function getEvents(): EventRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored =
      localStorage.getItem(
        EVENTS_KEY
      );

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(
      (item: Partial<EventRecord>) => ({
        id: item.id ?? "",
        title: item.title ?? "",
        description:
          item.description ?? "",
        date: item.date ?? "",
        duration:
          item.duration ?? "",
        format: item.format ?? "",
        scholarId:
          item.scholarId ?? "",
        attendees:
          Number(item.attendees ?? 0),

        status:
          item.status === "DRAFT"
            ? "DRAFT"
            : "PUBLISHED",

        showOnWebsite:
          item.showOnWebsite ?? true,

        summary:
          item.summary ?? "",

        testimonialQuote:
          item.testimonialQuote ?? "",

        testimonialName:
          item.testimonialName ?? "",

        testimonialOrganisation:
          item.testimonialOrganisation ??
          "",

        photos:
          Array.isArray(item.photos)
            ? item.photos
            : [],

        createdAt:
          item.createdAt ??
          new Date().toISOString(),

        updatedAt:
          item.updatedAt ??
          new Date().toISOString(),
      })
    );
  } catch {
    return [];
  }
}

export function saveEvents(
  events: EventRecord[]
): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    EVENTS_KEY,
    JSON.stringify(events)
  );
}


/* ============================================================
   TESTIMONIALS
   ============================================================ */

export function getTestimonials(): Testimonial[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored =
      localStorage.getItem(
        TESTIMONIALS_KEY
      );

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(
      (
        item: Partial<Testimonial>
      ) => ({
        id: item.id ?? "",

        quote:
          item.quote ?? "",

        travellerName:
          item.travellerName ?? "",

        titleOrganisation:
          item.titleOrganisation ?? "",

        linkedItem:
          item.linkedItem ?? "",

        status:
          item.status ===
          "APPROVED"
            ? "APPROVED"
            : "PENDING_REVIEW",

        showOnWebsite:
          item.showOnWebsite ?? false,

        createdAt:
          item.createdAt ??
          new Date().toISOString(),

        updatedAt:
          item.updatedAt ??
          new Date().toISOString(),
      })
    );
  } catch {
    return [];
  }
}

export function saveTestimonials(
  testimonials: Testimonial[]
): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    TESTIMONIALS_KEY,
    JSON.stringify(testimonials)
  );
}


/* ============================================================
   DESTINATIONS
   ============================================================ */

export function getDestinations(): Destination[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored =
      localStorage.getItem(
        DESTINATIONS_KEY
      );

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(
      (
        item: Partial<Destination>
      ) => ({
        id: item.id ?? "",

        name:
          item.name ?? "",

        region:
          item.region ?? "",

        country:
          item.country ?? "",

        description:
          item.description ?? "",

        coverImage:
          item.coverImage ?? "",

        showOnWebsite:
          item.showOnWebsite ?? true,

        createdAt:
          item.createdAt ??
          new Date().toISOString(),

        updatedAt:
          item.updatedAt ??
          new Date().toISOString(),
      })
    );
  } catch {
    return [];
  }
}

export function saveDestinations(
  destinations: Destination[]
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  /*
   * THIS is the Admin's real data.
   *
   * Keep exactly the same localStorage behavior.
   */
  localStorage.setItem(
    DESTINATIONS_KEY,
    JSON.stringify(
      destinations
    )
  );

  /*
   * Additional public-site copy.
   *
   * This never replaces the local data.
   */
  syncPublicCms();
}


/* ============================================================
   JOURNEYS
   ============================================================ */

export function getJourneys(): Journey[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored =
      localStorage.getItem(
        JOURNEYS_KEY
      );

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(
      (
        item: Partial<Journey>
      ) => ({
        id: item.id ?? "",
        title: item.title ?? "",

        startDate:
          item.startDate ?? "",

        endDate:
          item.endDate ?? "",

        duration:
          item.duration ?? "",

        coverImage:
          item.coverImage ?? "",

        standardPrice:
          Number(
            item.standardPrice ?? 0
          ),

        earlyBirdEnabled:
          item.earlyBirdEnabled ??
          false,

        earlyBirdPrice:
          Number(
            item.earlyBirdPrice ?? 0
          ),

        earlyBirdDeadline:
          item.earlyBirdDeadline ??
          "",

        groupSizeLimit:
          Number(
            item.groupSizeLimit ?? 0
          ),

        currentRegistrations:
          Number(
            item.currentRegistrations ??
              0
          ),

        status:
          item.status === "DRAFT"
            ? "DRAFT"
            : "PUBLISHED",

        showOnWebsite:
          item.showOnWebsite ?? true,

        createdAt:
          item.createdAt ??
          new Date().toISOString(),

        updatedAt:
          item.updatedAt ??
          new Date().toISOString(),
      })
    );
  } catch {
    return [];
  }
}

export function saveJourneys(
  journeys: Journey[]
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  /*
   * Keep Admin storage exactly as before.
   */
  localStorage.setItem(
    JOURNEYS_KEY,
    JSON.stringify(
      journeys
    )
  );

  /*
   * Create/update the public-site copy.
   */
  syncPublicCms();
}


/* ============================================================
   DESTINATION CONTENT
   ============================================================ */

export function getDestinationContents():
  DestinationContent[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored =
      localStorage.getItem(
        DESTINATION_CONTENT_KEY
      );

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(
      (
        item: Partial<DestinationContent>
      ) => ({
        id:
          item.id ??
          createId("ITN"),

        destinationId:
          item.destinationId ??
          "",

        journeyId:
          item.journeyId ?? "",

        days:
          Array.isArray(item.days)
            ? item.days
            : [],

        accommodations:
          Array.isArray(
            item.accommodations
          )
            ? item.accommodations
            : [],

        createdAt:
          item.createdAt ??
          new Date().toISOString(),

        updatedAt:
          item.updatedAt ??
          new Date().toISOString(),
      })
    );
  } catch {
    return [];
  }
}

export function saveDestinationContents(
  contents: DestinationContent[]
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  /*
   * Keep the Admin's relationship data
   * exactly where it already is.
   */
  localStorage.setItem(
    DESTINATION_CONTENT_KEY,
    JSON.stringify(
      contents
    )
  );

  /*
   * Sync a copy to the public website.
   */
  syncPublicCms();
}
export function getDestinationContent(
  destinationId: string,
  journeyId: string
): DestinationContent | null {
  const contents =
    getDestinationContents();

  return (
    contents.find(
      (item) =>
        item.destinationId ===
          destinationId &&
        item.journeyId ===
          journeyId
    ) ?? null
  );
}

export function saveDestinationContent(
  content: DestinationContent
): void {
  const contents =
    getDestinationContents();

  const index =
    contents.findIndex(
      (item) =>
        item.destinationId ===
          content.destinationId &&
        item.journeyId ===
          content.journeyId
    );

  if (index >= 0) {
    contents[index] = {
      ...content,
      updatedAt:
        new Date().toISOString(),
    };
  } else {
    contents.push({
      ...content,
      createdAt:
        content.createdAt ||
        new Date().toISOString(),
      updatedAt:
        new Date().toISOString(),
    });
  }

  saveDestinationContents(
    contents
  );
}

export function deleteDestinationContent(
  destinationId: string,
  journeyId: string
): void {
  const contents =
    getDestinationContents();

  saveDestinationContents(
    contents.filter(
      (item) =>
        !(
          item.destinationId ===
            destinationId &&
          item.journeyId ===
            journeyId
        )
    )
  );
}


/* ============================================================
   RELATION HELPERS
   ============================================================ */

export function getContentForDestination(
  destinationId: string
): DestinationContent[] {
  return getDestinationContents().filter(
    (item) =>
      item.destinationId ===
      destinationId
  );
}

export function getContentForJourney(
  journeyId: string
): DestinationContent[] {
  return getDestinationContents().filter(
    (item) =>
      item.journeyId === journeyId
  );
}

/* ============================================================
   ACTIVITY ICON LIBRARY
   ============================================================ */

export function getActivityIcons(): ActivityIcon[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored =
      localStorage.getItem(
        ACTIVITY_ICONS_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(
      (
        item: Partial<ActivityIcon>
      ) => ({
        id:
          item.id ?? "",

        name:
          item.name ?? "",

        slug:
          item.slug ?? "",

        description:
          item.description ?? "",

        image:
          item.image ?? "",

        showOnWebsite:
          item.showOnWebsite ??
          true,

        createdAt:
          item.createdAt ??
          new Date().toISOString(),

        updatedAt:
          item.updatedAt ??
          new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error(
      "Failed to load activity icons:",
      error
    );

    return [];
  }
}


export function saveActivityIcons(
  icons: ActivityIcon[]
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    ACTIVITY_ICONS_KEY,
    JSON.stringify(icons)
  );
}


export function getActivityIcon(
  activityType: ItineraryStopType
): ActivityIcon | null {
  const icons =
    getActivityIcons();

  const slug =
    activityType
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      );

  return (
    icons.find(
      (icon) =>
        icon.name ===
          activityType ||
        icon.slug ===
          slug
    ) ?? null
  );
}
/* ============================================================
   ID GENERATOR
   ============================================================ */

export function createId(
  prefix: string
): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
/* ============================================================
   HOMEPAGE CURATION
   ============================================================ */

export type HomepageCuration = {
  /* Current draft selections */

  featuredEventIds: string[];

  featuredDestinationIds: string[];

  featuredJourneyIds: string[];

  featuredScholarIds: string[];

  featuredTestimonialIds: string[];


  /* Published selections */

  publishedFeaturedEventIds: string[];

  publishedFeaturedDestinationIds: string[];

  publishedFeaturedJourneyIds: string[];

  publishedFeaturedScholarIds: string[];

  publishedFeaturedTestimonialIds: string[];


  /* Metadata */

  updatedAt: string;

  publishedAt: string;
};


const DEFAULT_HOMEPAGE_CURATION: HomepageCuration = {
  featuredEventIds: [],

  featuredDestinationIds: [],

  featuredJourneyIds: [],

  featuredScholarIds: [],

  featuredTestimonialIds: [],


  publishedFeaturedEventIds: [],

  publishedFeaturedDestinationIds: [],

  publishedFeaturedJourneyIds: [],

  publishedFeaturedScholarIds: [],

  publishedFeaturedTestimonialIds: [],


  updatedAt: "",

  publishedAt: "",
};


/* ============================================================
   GET HOMEPAGE CURATION
   ============================================================ */

export function getHomepageCuration(): HomepageCuration {
  if (typeof window === "undefined") {
    return DEFAULT_HOMEPAGE_CURATION;
  }

  try {
    const stored =
      localStorage.getItem(
        HOMEPAGE_CURATION_KEY
      );

    if (!stored) {
      return DEFAULT_HOMEPAGE_CURATION;
    }

    const parsed = JSON.parse(
      stored
    );

    return {
      /* --------------------------------------------------------
         CURRENT DRAFT
         -------------------------------------------------------- */

      featuredEventIds:
        Array.isArray(
          parsed.featuredEventIds
        )
          ? parsed.featuredEventIds
          : [],

      featuredDestinationIds:
        Array.isArray(
          parsed.featuredDestinationIds
        )
          ? parsed.featuredDestinationIds
          : [],

      featuredJourneyIds:
        Array.isArray(
          parsed.featuredJourneyIds
        )
          ? parsed.featuredJourneyIds
          : [],

      featuredScholarIds:
        Array.isArray(
          parsed.featuredScholarIds
        )
          ? parsed.featuredScholarIds
          : [],

      featuredTestimonialIds:
        Array.isArray(
          parsed.featuredTestimonialIds
        )
          ? parsed.featuredTestimonialIds
          : [],


      /* --------------------------------------------------------
         PUBLISHED VERSION
         -------------------------------------------------------- */

      publishedFeaturedEventIds:
        Array.isArray(
          parsed.publishedFeaturedEventIds
        )
          ? parsed.publishedFeaturedEventIds
          : [],

      publishedFeaturedDestinationIds:
        Array.isArray(
          parsed.publishedFeaturedDestinationIds
        )
          ? parsed.publishedFeaturedDestinationIds
          : [],

      publishedFeaturedJourneyIds:
        Array.isArray(
          parsed.publishedFeaturedJourneyIds
        )
          ? parsed.publishedFeaturedJourneyIds
          : [],

      publishedFeaturedScholarIds:
        Array.isArray(
          parsed.publishedFeaturedScholarIds
        )
          ? parsed.publishedFeaturedScholarIds
          : [],

      publishedFeaturedTestimonialIds:
        Array.isArray(
          parsed.publishedFeaturedTestimonialIds
        )
          ? parsed.publishedFeaturedTestimonialIds
          : [],


      /* --------------------------------------------------------
         DATES
         -------------------------------------------------------- */

      updatedAt:
        typeof parsed.updatedAt ===
        "string"
          ? parsed.updatedAt
          : "",

      publishedAt:
        typeof parsed.publishedAt ===
        "string"
          ? parsed.publishedAt
          : "",
    };
  } catch (error) {
    console.error(
      "Failed to load homepage curation:",
      error
    );

    return DEFAULT_HOMEPAGE_CURATION;
  }
}


/* ============================================================
   SAVE HOMEPAGE CURATION
   ============================================================ */

export function saveHomepageCuration(
  curation: HomepageCuration
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    HOMEPAGE_CURATION_KEY,
    JSON.stringify(curation)
  );
}


/* ============================================================
   PUBLISH HOMEPAGE CURATION
   ============================================================ */

export function publishHomepageCuration(
  curation: HomepageCuration
): HomepageCuration {
  const now =
    new Date().toISOString();

  const published: HomepageCuration = {
    ...curation,

    /*
     * Events
     */
    publishedFeaturedEventIds: [
      ...curation.featuredEventIds,
    ],


    /*
     * Destinations
     */
    publishedFeaturedDestinationIds: [
      ...curation.featuredDestinationIds,
    ],


    /*
     * Journeys
     */
    publishedFeaturedJourneyIds: [
      ...curation.featuredJourneyIds,
    ],


    /*
     * Intellects / Scholars
     */
    publishedFeaturedScholarIds: [
      ...curation.featuredScholarIds,
    ],


    /*
     * Testimonials
     */
    publishedFeaturedTestimonialIds: [
      ...curation.featuredTestimonialIds,
    ],


    updatedAt: now,

    publishedAt: now,
  };

  saveHomepageCuration(
    published
  );

  return published;
}