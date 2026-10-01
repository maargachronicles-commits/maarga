"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Container from "./Container.svg";


/* ================================================================
   TYPES
================================================================ */

type Journey = {
  id: string;
  title: string;

  startDate: string;
  endDate: string;

  duration: string;

  coverImage: string;

  standardPrice: number;

  status: "PUBLISHED" | "DRAFT";

  showOnWebsite: boolean;
};

type Destination = {
  id: string;
  name: string;

  region: string;
  country: string;

  description: string;

  coverImage: string;

  showOnWebsite: boolean;
};

type DestinationContent = {
  id: string;

  destinationId: string;

  journeyId: string;
};

type CmsHomepageData = {
  journeys: Journey[];

  destinations: Destination[];

  destinationContents: DestinationContent[];
};

type Trip = {
  id: string;

  journeyId: string;

  category: string;

  title: string;

  location: string;

  dates: string;

  duration: string;

  body: string;

  image: string;

  price: number;
};


/* ================================================================
   API
================================================================ */

const ADMIN_API_URL =
  "http://localhost:3000/api/public/homepage";


/* ================================================================
   ⭐ EASY LAYOUT CONTROLS
   ---------------------------------------------------------------
   Change ONLY these values when you want to move things around.
================================================================ */

const LAYOUT = {

  /* Whole Story6 section */
  section: {
    minHeight: "570px",

    paddingTop: "38px",

    paddingBottom: "30px",

    background: "#FFFFFF",
  },


  /* Header */
  header: {

    width: "760px",

    maxWidth:
      "calc(100vw - 40px)",

    gap: "11px",
  },


  /* Small red "Our Trips" label */
  label: {
    fontSize: "14px",

    color: "#A62F20",
  },


  /* Main heading */
  heading: {
    fontSize:
      "clamp(28px, 3vw, 38px)",

    lineHeight: "1.1",

    color: "#272727",
  },


  /* Header description */
  description: {
    marginTop: "20px",

    maxWidth: "700px",

    fontSize: "11px",

    lineHeight: "1.45",

    color: "#666666",
  },


  /* ============================================================
     CAROUSEL
  ============================================================ */

  carousel: {
  marginTop: "45px",

  cardWidth:
    "clamp(320px, 58vw, 900px)",

  cardHeight:
    "min(361px, calc(100vw - 80px))",

  redPanelWidth:
    "225px",

  /*
   * ⭐ SPACE BETWEEN CARDS
   *
   * Change this one value.
   */
  gap: "40px",

  sidePeek:
    "80px",
},


  /* ============================================================
     CARD
  ============================================================ */

  card: {

    category: {
      marginBottom:
        "9px",

      fontSize:
        "10px",

      color:
        "rgba(255,255,255,0.62)",
    },

    title: {
      fontSize:
        "25px",

      lineHeight:
        "1.05",

      color:
        "#FFFFFF",
    },

    location: {
      marginTop:
        "7px",

      fontSize:
        "10px",

      color:
        "rgba(255,255,255,0.88)",
    },

    dateRow: {
      marginTop:
        "9px",

      fontSize:
        "10px",

      color:
        "rgba(255,255,255,0.88)",
    },

    description: {
      marginTop:
        "27px",

      fontSize:
        "10px",

      lineHeight:
        "1.45",

      color:
        "rgba(255,255,255,0.93)",
    },

    button: {
      height:
        "32px",

      fontSize:
        "10px",

      color:
        "#A62F20",

      background:
        "#FFFFFF",
    },
  },


  /* ============================================================
     ARROWS
  ============================================================ */

  arrows: {

    marginTop:
      "20px",

    gap:
      "9px",

    size:
      "25px",

    fontSize:
      "17px",

    border:
      "#E4C5BE",

    color:
      "#A62F20",

    background:
      "#FFFFFF",
  },

};


/* ================================================================
   DATE FORMAT
================================================================ */

function formatDate(
  value: string
): string {

  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


/* ================================================================
   DATE RANGE
================================================================ */

function formatDateRange(
  startDate: string,
  endDate: string
): string {

  if (
    !startDate &&
    !endDate
  ) {
    return "Coming soon";
  }

  if (!startDate) {
    return formatDate(
      endDate
    );
  }

  if (!endDate) {
    return formatDate(
      startDate
    );
  }

  const start =
    new Date(startDate);

  const end =
    new Date(endDate);

  if (
    Number.isNaN(
      start.getTime()
    ) ||
    Number.isNaN(
      end.getTime()
    )
  ) {
    return `${startDate} – ${endDate}`;
  }

  const sameMonth =
    start.getMonth() ===
      end.getMonth() &&
    start.getFullYear() ===
      end.getFullYear();

  if (sameMonth) {

    return `${start.getDate()}–${end.getDate()} ${start.toLocaleDateString(
      "en-GB",
      {
        month: "short",
        year: "numeric",
      }
    )}`;

  }

  return `${formatDate(
    startDate
  )} – ${formatDate(
    endDate
  )}`;
}


/* ================================================================
   FETCH CMS DATA
================================================================ */

async function fetchCmsData(): Promise<CmsHomepageData> {

  const response =
    await fetch(
      ADMIN_API_URL,
      {
        method:
          "GET",

        cache:
          "no-store",

        headers: {
          Accept:
            "application/json",
        },
      }
    );


  if (!response.ok) {

    throw new Error(
      `CMS API returned ${response.status}`
    );

  }


  const data =
    await response.json();


  return {

    journeys:
      Array.isArray(
        data?.journeys
      )
        ? data.journeys
        : [],

    destinations:
      Array.isArray(
        data?.destinations
      )
        ? data.destinations
        : [],

    destinationContents:
      Array.isArray(
        data?.destinationContents
      )
        ? data.destinationContents
        : [],

  };

}


/* ================================================================
   BUILD HOMEPAGE TRIPS
================================================================ */

function buildTrips(
  data: CmsHomepageData
): Trip[] {

  /*
   * Only published journeys that are
   * intentionally visible on the website.
   */
  const publicJourneys =
    data.journeys.filter(
      (
        journey
      ) =>
        journey.status ===
          "PUBLISHED" &&
        journey.showOnWebsite ===
          true
    );


  return publicJourneys.map(
    (
      journey
    ) => {

      /*
       * Journey → DestinationContent
       */
      const relationship =
        data.destinationContents.find(
          (
            content
          ) =>
            content.journeyId ===
            journey.id
        );


      /*
       * DestinationContent → Destination
       */
      const destination =
        relationship
          ? data.destinations.find(
              (
                item
              ) =>
                item.id ===
                relationship.destinationId
            )
          : undefined;


      const locationParts =
        [
          destination?.name,
          destination?.region,
        ].filter(Boolean);


      const location =
        locationParts.length
          ? locationParts.join(
              ", "
            )
          : destination?.country ||
            "India";


      return {

        id:
          journey.id,

        journeyId:
          journey.id,

        category:
          "The Architecture of an Empire",

        title:
          journey.title ||
          "Untitled Journey",

        location,

        dates:
          formatDateRange(
            journey.startDate,
            journey.endDate
          ),

        duration:
          journey.duration ||
          "",

        body:
          destination?.description ||
          "A carefully designed journey through places, histories and living heritage.",

        image:
          journey.coverImage ||
          destination?.coverImage ||
          "",

        price:
          Number(
            journey.standardPrice
          ) || 0,

      };

    }
  );

}


/* ================================================================
   TRIP CARD
================================================================ */

function TripCard({
  trip,
  active = false,
  onClick,
}: {
  trip: Trip;

  active?: boolean;

  onClick?: () => void;
}) {

  return (

    <article
      onClick={onClick}

      className={[
        "flex",
        "flex-shrink-0",
        "overflow-hidden",
        "transition-transform",
        "duration-300",
        active
          ? "z-20"
          : "z-10 cursor-pointer",
      ].join(" ")}

      style={{
        width:
          `min(${LAYOUT.carousel.cardWidth}, calc(100vw - 40px))`,

        height:
          LAYOUT.carousel.cardHeight,

        boxShadow:
          active
            ? "none"
            : "0 4px 20px rgba(0,0,0,0.04)",
      }}
    >

      {/* ==========================================================
          RED INFORMATION PANEL
      ========================================================== */}

      <div
        className="flex h-full flex-shrink-0 flex-col"

        style={{
          width:
            LAYOUT.carousel.redPanelWidth,

          background:
            "#A62F20",

          padding:
            "13px 18px 18px",
        }}
      >

        {/* CATEGORY */}

        <p
          style={{
            margin: 0,

            marginBottom:
              LAYOUT.card.category.marginBottom,

            fontSize:
              LAYOUT.card.category.fontSize,

            color:
              LAYOUT.card.category.color,

            whiteSpace:
              "nowrap",

            overflow:
              "hidden",

            textOverflow:
              "ellipsis",
          }}
        >
          {trip.category}
        </p>


        {/* TITLE */}

        <h3
          style={{
            margin: 0,

            fontFamily:
              "Georgia, serif",

            fontSize:
              LAYOUT.card.title.fontSize,

            lineHeight:
              LAYOUT.card.title.lineHeight,

            color:
              LAYOUT.card.title.color,

            fontWeight:
              400,
          }}
        >
          {trip.title}
        </h3>


        {/* LOCATION */}

        <p
          style={{
            margin:
              `${LAYOUT.card.location.marginTop} 0 0`,

            fontSize:
              LAYOUT.card.location.fontSize,

            color:
              LAYOUT.card.location.color,

            whiteSpace:
              "nowrap",

            overflow:
              "hidden",

            textOverflow:
              "ellipsis",
          }}
        >
          {trip.location}
        </p>


        {/* DATE / DURATION */}

        <div
          className="flex items-center justify-between"

          style={{
            margin:
              `${LAYOUT.card.dateRow.marginTop} 0 0`,

            fontSize:
              LAYOUT.card.dateRow.fontSize,

            color:
              LAYOUT.card.dateRow.color,
          }}
        >

          <span>
            {trip.dates}
          </span>

          <span>
            {trip.duration}
          </span>

        </div>


        {/* DESCRIPTION */}

        <p
          style={{
            margin:
              `${LAYOUT.card.description.marginTop} 0 0`,

            fontSize:
              LAYOUT.card.description.fontSize,

            lineHeight:
              LAYOUT.card.description.lineHeight,

            color:
              LAYOUT.card.description.color,

            display:
              "-webkit-box",

            WebkitLineClamp:
              8,

            WebkitBoxOrient:
              "vertical",

            overflow:
              "hidden",
          }}
        >
          {trip.body}
        </p>


        {/* BOOK NOW */}

        <Link
          href={
            `/journeys/${trip.journeyId}`
          }

          onClick={(event) =>
            event.stopPropagation()
          }

          className="mt-auto flex w-full items-center justify-center no-underline"

          style={{
            height:
              LAYOUT.card.button.height,

            fontSize:
              LAYOUT.card.button.fontSize,

            color:
              LAYOUT.card.button.color,

            background:
              LAYOUT.card.button.background,
          }}
        >
          Book Now
        </Link>

      </div>


      {/* ==========================================================
          IMAGE
      ========================================================== */}

      <div
        className="relative min-w-0 flex-1 overflow-hidden bg-[#EAE4DE]"
      >

        {trip.image ? (

          <img
            src={
              trip.image
            }

            alt={
              trip.title
            }

            className="block h-full w-full object-cover"

            style={{
              objectPosition:
                "center center",
            }}
          />

        ) : (

          <img
            src={
              Container.src
            }

            alt=""
            
            className="block h-full w-full object-cover"

            style={{
              objectPosition:
                "center center",
            }}
          />

        )}

      </div>

    </article>

  );

}


/* ================================================================
   HEADER
================================================================ */

function Header() {
  return (
    <header
      className="flex w-full flex-col items-center text-center"
      style={{
        paddingLeft: "20px",
        paddingRight: "20px",
        boxSizing: "border-box",
        gap: LAYOUT.header.gap,
      }}
    >
      <p
        style={{
          margin: 0,
          textAlign: "center",
          fontSize: LAYOUT.label.fontSize,
          lineHeight: "1",
          color: LAYOUT.label.color,
        }}
      >
        Our Trips
      </p>

      <h2
        style={{
          width: "100%",
          margin: 0,

          fontFamily:
            "Georgia, 'Times New Roman', serif",

          fontSize:
            LAYOUT.heading.fontSize,

          lineHeight:
            LAYOUT.heading.lineHeight,

          fontWeight: 400,

          textAlign: "center",

          color:
            LAYOUT.heading.color,
        }}
      >
        What Trips Are We Organising Now
      </h2>

      <p
        style={{
          width: "100%",
          maxWidth:
            LAYOUT.description.maxWidth,

          margin:
            `${LAYOUT.description.marginTop} auto 0`,

          fontSize:
            LAYOUT.description.fontSize,

          lineHeight:
            LAYOUT.description.lineHeight,

          textAlign: "center",

          color:
            LAYOUT.description.color,
        }}
      >
        Explore carefully designed scholar-led
        journeys through places, histories and
        living heritage.
      </p>
    </header>
  );
}


/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyTrips() {

  return (

    <div
      className="flex flex-1 items-center justify-center"
    >

      <div className="text-center">

        <p
          style={{
            margin: 0,

            fontFamily:
              "Georgia, serif",

            fontSize:
              "25px",

            color:
              "#292725",
          }}
        >
          No journeys available
        </p>


        <p
          style={{
            margin:
              "8px 0 0",

            fontSize:
              "11px",

            color:
              "#777",
          }}
        >
          Published journeys marked
          “Show on website” will appear here.
        </p>

      </div>

    </div>

  );

}


/* ================================================================
   STORY 6
================================================================ */

export default function Story6() {

  const [data, setData] =
    useState<CmsHomepageData>({
      journeys: [],

      destinations: [],

      destinationContents: [],
    });


  const [activeIndex, setActiveIndex] =
    useState(0);


  const [loaded, setLoaded] =
    useState(false);


  /* ============================================================
     FETCH CMS
  ============================================================ */

  useEffect(() => {

    let cancelled =
      false;


    const load =
      async () => {

        try {

          const cmsData =
            await fetchCmsData();


          if (
            cancelled
          ) {
            return;
          }


          setData(
            cmsData
          );


          setLoaded(
            true
          );


        } catch (error) {

          console.error(
            "[Story6] Failed to load CMS:",
            error
          );


          if (
            cancelled
          ) {
            return;
          }


          setLoaded(
            true
          );

        }

      };


    void load();


    /*
     * Future CMS refresh event.
     */
    const handleCmsUpdate =
      () => {
        void load();
      };


    window.addEventListener(
      "maarga-cms-updated",
      handleCmsUpdate
    );


    return () => {

      cancelled =
        true;


      window.removeEventListener(
        "maarga-cms-updated",
        handleCmsUpdate
      );

    };

  }, []);


  /* ============================================================
     BUILD TRIPS
  ============================================================ */

  const trips =
    useMemo(
      () =>
        buildTrips(
          data
        ),
      [data]
    );


  /* ============================================================
     RESET INDEX WHEN DATA CHANGES
  ============================================================ */

  useEffect(() => {

    setActiveIndex(
      (
        current
      ) => {

        if (
          trips.length ===
          0
        ) {
          return 0;
        }


        if (
          current >=
          trips.length
        ) {
          return 0;
        }


        return current;

      }
    );

  }, [
    trips.length,
  ]);


  /* ============================================================
     LOADING
  ============================================================ */

  if (!loaded) {

    return (

      <section
        className="flex w-full flex-col overflow-hidden"

        style={{
          minHeight:
            LAYOUT.section.minHeight,

          paddingTop:
            LAYOUT.section.paddingTop,

          paddingBottom:
            LAYOUT.section.paddingBottom,

          background:
            LAYOUT.section.background,
        }}
      />

    );

  }


  /* ============================================================
     EMPTY
  ============================================================ */

  if (
    trips.length ===
    0
  ) {

    return (

      <section
        className="flex w-full flex-col overflow-hidden"

        style={{
          minHeight:
            LAYOUT.section.minHeight,

          paddingTop:
            LAYOUT.section.paddingTop,

          paddingBottom:
            LAYOUT.section.paddingBottom,

          background:
            LAYOUT.section.background,
        }}
      >

        <Header />

        <EmptyTrips />

      </section>

    );

  }


  /* ============================================================
     INDEXES
  ============================================================ */

  const previousIndex =
    trips.length > 1
      ? (
          activeIndex -
          1 +
          trips.length
        ) %
        trips.length
      : activeIndex;


  const nextIndex =
    trips.length > 1
      ? (
          activeIndex +
          1
        ) %
        trips.length
      : activeIndex;


  const previousTrip =
    trips[
      previousIndex
    ];


  const activeTrip =
    trips[
      activeIndex
    ];


  const nextTrip =
    trips[
      nextIndex
    ];


  /* ============================================================
     NAVIGATION
  ============================================================ */

  const goPrevious =
    () => {

      if (
        trips.length <=
        1
      ) {
        return;
      }


      setActiveIndex(
        (
          current
        ) =>
          current ===
          0
            ? trips.length -
              1
            : current - 1
      );

    };


  const goNext =
    () => {

      if (
        trips.length <=
        1
      ) {
        return;
      }


      setActiveIndex(
        (
          current
        ) =>
          current ===
          trips.length -
            1
            ? 0
            : current + 1
      );

    };


  /* ============================================================
     RENDER
  ============================================================ */

  return (

    <section
      className="flex w-full flex-col overflow-hidden"

      style={{
        minHeight:
          LAYOUT.section.minHeight,

        paddingTop:
          LAYOUT.section.paddingTop,

        paddingBottom:
          LAYOUT.section.paddingBottom,

        background:
          LAYOUT.section.background,
      }}
    >

      {/* ========================================================
          HEADER
      ======================================================== */}

      <Header />


      {/* ========================================================
          CAROUSEL VIEWPORT
      ======================================================== */}

      <div
  className="relative w-full overflow-hidden"
  style={{
    marginTop:
      LAYOUT.carousel.marginTop,

    width: "100vw",

    marginLeft: "calc(50% - 50vw)",
  }}
>

        <div
          className="flex w-full items-stretch justify-center"

          style={{
            gap:
              LAYOUT.carousel.gap,
          }}
        >

          {/* ====================================================
              PREVIOUS CARD
          ==================================================== */}

          {trips.length > 1 && (

            <TripCard
              trip={
                previousTrip
              }

              onClick={
                goPrevious
              }
            />

          )}


          {/* ====================================================
              ACTIVE CARD
          ==================================================== */}

          <TripCard
            trip={
              activeTrip
            }

            active
          />


          {/* ====================================================
              NEXT CARD
          ==================================================== */}

          {trips.length > 1 && (

            <TripCard
              trip={
                nextTrip
              }

              onClick={
                goNext
              }
            />

          )}

        </div>

      </div>


      {/* ========================================================
          ARROWS
      ======================================================== */}

      {trips.length > 1 && (

        <div
          className="flex items-center justify-center"

          style={{
            marginTop:
              LAYOUT.arrows.marginTop,

            gap:
              LAYOUT.arrows.gap,
          }}
        >

          {/* PREVIOUS */}

          <button
            type="button"

            onClick={
              goPrevious
            }

            aria-label="Previous trip"

            style={{
              width:
                LAYOUT.arrows.size,

              height:
                LAYOUT.arrows.size,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              padding: 0,

              border:
                `1px solid ${LAYOUT.arrows.border}`,

              background:
                LAYOUT.arrows.background,

              color:
                LAYOUT.arrows.color,

              fontSize:
                LAYOUT.arrows.fontSize,

              lineHeight:
                "1",

              cursor:
                "pointer",
            }}
          >
            ‹
          </button>


          {/* NEXT */}

          <button
            type="button"

            onClick={
              goNext
            }

            aria-label="Next trip"

            style={{
              width:
                LAYOUT.arrows.size,

              height:
                LAYOUT.arrows.size,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              padding: 0,

              border:
                `1px solid ${LAYOUT.arrows.border}`,

              background:
                LAYOUT.arrows.background,

              color:
                LAYOUT.arrows.color,

              fontSize:
                LAYOUT.arrows.fontSize,

              lineHeight:
                "1",

              cursor:
                "pointer",
            }}
          >
            ›
          </button>

        </div>

      )}

    </section>

  );

}