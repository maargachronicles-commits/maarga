"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Group from "./assets/Group12";


/* ============================================================
   SVG ROW TOLERANCE
============================================================ */

const Y_BAND = 22;


/* ============================================================
   SPLIT COMPOUND SVG PATH
============================================================ */

function splitCompoundPath(
  path: SVGPathElement
): SVGPathElement[] {
  const d = path.getAttribute("d");

  if (!d) {
    return [path];
  }

  const parts = d
    .split(/(?=[Mm])/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return [path];
  }

  const parent = path.parentNode;

  if (!parent) {
    return [path];
  }

  const newPaths = parts.map(
    (part) => {
      const clone =
        path.cloneNode(false) as SVGPathElement;

      clone.setAttribute(
        "d",
        part
      );

      return clone;
    }
  );

  newPaths.forEach(
    (newPath) => {
      parent.insertBefore(
        newPath,
        path
      );
    }
  );

  path.remove();

  return newPaths;
}


/* ============================================================
   APP
============================================================ */

export default function App() {

  const pageRef =
    useRef<HTMLDivElement>(null);

  const svgWrapRef =
    useRef<HTMLDivElement>(null);

  const timelineRef =
    useRef<gsap.core.Timeline | null>(
      null
    );


  /*
   * Text is NOT typed anymore.
   *
   * It simply spawns in once Story 3 begins.
   */
  const [textVisible, setTextVisible] =
    useState(false);


  const textShownRef =
    useRef(false);


  const textLines = [
    "Maarga is the thread between the intellectually curious",
    "and those who have given their lives to studying India's",
    "heritage. Not a tour. A path to understanding.",
  ];


  /* ============================================================
     SVG DRAWING SETUP
============================================================ */

  useEffect(() => {

    const wrap =
      svgWrapRef.current;

    if (!wrap) {
      return;
    }


    const svg =
      wrap.querySelector("svg");

    if (!svg) {
      return;
    }


    /* ----------------------------------------------------------
       1. COLLECT PATHS
    ---------------------------------------------------------- */

    let allPaths =
      Array.from(
        svg.querySelectorAll("path")
      ) as SVGPathElement[];


    if (
      allPaths.length ===
      0
    ) {
      return;
    }


    /* ----------------------------------------------------------
       2. SPLIT COMPOUND PATHS
    ---------------------------------------------------------- */

    const expandedPaths:
      SVGPathElement[] = [];


    allPaths.forEach(
      (path) => {
        expandedPaths.push(
          ...splitCompoundPath(
            path
          )
        );
      }
    );


    allPaths =
      expandedPaths;


    /* ----------------------------------------------------------
       3. MEASURE PATHS
    ---------------------------------------------------------- */

    type PathData = {
      el: SVGPathElement;

      cx: number;

      cy: number;

      len: number;
    };


    const measured:
      PathData[] =
      allPaths.map(
        (el) => {

          let cx = 0;

          let cy = 0;

          let len = 1;


          try {

            const bb =
              el.getBBox();


            cx =
              bb.x +
              bb.width /
                2;


            cy =
              bb.y +
              bb.height /
                2;


            len =
              Math.max(
                el.getTotalLength(),
                1
              );

          } catch {
            /*
             * Degenerate paths stay at origin.
             */
          }


          return {
            el,
            cx,
            cy,
            len,
          };

        }
      );


    /* ----------------------------------------------------------
       4. SORT TOP → BOTTOM / LEFT → RIGHT
    ---------------------------------------------------------- */

    measured.sort(
      (
        a,
        b
      ) => {

        const dy =
          a.cy -
          b.cy;


        if (
          Math.abs(
            dy
          ) >
          Y_BAND
        ) {
          return dy;
        }


        return (
          a.cx -
          b.cx
        );

      }
    );


    const drawingOrder =
      measured.map(
        (item) =>
          item.el
      );


    const lengths =
      measured.map(
        (item) =>
          item.len
      );


    const totalLength =
      lengths.reduce(
        (
          a,
          b
        ) =>
          a + b,
        0
      );


    /* ----------------------------------------------------------
       5. HIDE PATHS
    ---------------------------------------------------------- */

    drawingOrder.forEach(
      (
        path,
        index
      ) => {

        path.style.strokeDasharray =
          String(
            lengths[index]
          );

        path.style.strokeDashoffset =
          String(
            lengths[index]
          );

      }
    );


    /* ----------------------------------------------------------
       6. BUILD DRAWING TIMELINE
    ---------------------------------------------------------- */

    const ctx =
      gsap.context(
        () => {

          const tl =
            gsap.timeline({
              paused: true,
            });


          timelineRef.current =
            tl;


          drawingOrder.forEach(
            (
              path,
              index
            ) => {

              const proportion =
                lengths[index] /
                totalLength;


              const TARGET_DURATION =
                30.07;


              const duration =
                Math.max(
                  proportion *
                    TARGET_DURATION,
                  0.001
                );


              tl.to(
                path,
                {
                  strokeDashoffset:
                    0,

                  duration,

                  ease:
                    "none",
                },
                index ===
                  0
                  ? 0
                  : "-=0.02"
              );

            }
          );

        }
      );


    /* ----------------------------------------------------------
       7. RECEIVE STORY PROGRESS
    ---------------------------------------------------------- */

    const handleStoryProgress =
      (
        event: Event
      ) => {

        const customEvent =
          event as CustomEvent<{
            story: number;

            progress: number;
          }>;


        /*
         * Story 3 only.
         */
        if (
          customEvent.detail?.story !==
          3
        ) {
          return;
        }


        const progress =
          Math.max(
            0,
            Math.min(
              1,
              customEvent
                .detail
                .progress
            )
          );


        /*
         * SVG keeps following the
         * parent's scroll progress.
         */
        if (
          timelineRef.current
        ) {

          timelineRef.current.progress(
            progress
          );

        }


        /*
         * TEXT SPAWN
         *
         * The entire text appears once
         * Story 3 starts.
         */
        if (
          progress > 0 &&
          !textShownRef.current
        ) {

          textShownRef.current =
            true;

          setTextVisible(
            true
          );

        }

      };


    window.addEventListener(
      "maarga-story-progress",
      handleStoryProgress
    );


    return () => {

      window.removeEventListener(
        "maarga-story-progress",
        handleStoryProgress
      );


      timelineRef.current =
        null;


      ctx.revert();

    };

  }, []);


  /* ============================================================
     SKIP
============================================================ */

  const handleSkip =
    () => {

      /*
       * Finish drawing immediately.
       */
      if (
        timelineRef.current
      ) {

        timelineRef.current.progress(
          1
        );

      }


      /*
       * Show all text immediately.
       */
      textShownRef.current =
        true;

      setTextVisible(
        true
      );


      /*
       * Tell StoryStack that
       * Story 3 is complete.
       */
      window.dispatchEvent(
        new CustomEvent(
          "maarga-story-skip",
          {
            detail: {
              story: 3,
            },
          }
        )
      );

    };


  return (
    <>
      {/* ========================================================
          STYLES
      ======================================================== */}

      <style>{`

        /* =====================================================
           SVG DRAWING
        ===================================================== */

        .sketch-svg-wrap path {
          fill: none !important;

          stroke-linecap: round;

          stroke-linejoin: round;
        }


        .sketch-svg-wrap path[fill="#A62F20"] {
          stroke: #A62F20;

          stroke-width: 0.8;
        }


        .sketch-svg-wrap path[fill="#272727"] {
          stroke: #272727;

          stroke-width: 1.9;
        }


        /* =====================================================
           TEXT SPAWN
        ===================================================== */

        .story3-text {
          opacity: 0;

          transform:
            translateY(12px);

          transition:
            opacity 500ms ease,
            transform 500ms ease;
        }


        .story3-text.is-visible {
          opacity: 1;

          transform:
            translateY(0);
        }

      `}</style>


      {/* ========================================================
          PAGE
      ======================================================== */}

      <div
        ref={pageRef}
        className="relative h-screen w-full overflow-hidden bg-[#faf9f6]"
      >

        {/* ======================================================
            TEXT CONTENT
        ====================================================== */}

        <div className="pointer-events-none absolute inset-0 z-30">


          {/* ====================================================
              SMALL HEADING
          ==================================================== */}

          <div
            className="absolute left-[11%] top-[12%] text-[14px] text-[#666]"
          >
            What is Maarga
          </div>


          {/* ====================================================
              PAGE NUMBER
          ==================================================== */}

          <div
            className="absolute left-[44%] top-[12%] text-[14px] text-[#666]"
          >
            3/3
          </div>


          {/* ====================================================
              MAIN TEXT
          ==================================================== */}

          <div
            className={`
              story3-text
              absolute
              left-[11%]
              top-[15%]
              w-[520px]
              ${
                textVisible
                  ? "is-visible"
                  : ""
              }
            `}
          >

            <div
              className="text-[20px] leading-[1.3] text-[#A62F20]"
            >

              {textLines.map(
                (
                  line,
                  lineIndex
                ) => (

                  <div
                    key={
                      lineIndex
                    }
                    className="whitespace-nowrap"
                  >
                    {line}
                  </div>

                )
              )}

            </div>

          </div>


          {/* ====================================================
              BOTTOM CTA
          ==================================================== */}

          <div
            className="absolute bottom-[3%] left-1/2 -translate-x-1/2"
          >

            <span
              className="text-[14px] text-[#A62F20] underline"
            >
              Learn more About us →
            </span>

          </div>


          {/* ====================================================
              SKIP
          ==================================================== */}

          <div
            className="pointer-events-auto absolute bottom-[3%] right-[8%] cursor-pointer"
            onClick={
              handleSkip
            }
          >

            <span
              className="text-[14px] italic text-[#A62F20] underline"
            >
              Skip →
            </span>

          </div>

        </div>


        {/* ======================================================
            SIDEBAR
        ====================================================== */}

        <img
          src="/sidebar.svg"
          alt=""
          className="pointer-events-none absolute left-0 top-0 z-20 h-full w-auto"
        />


        {/* ======================================================
            EXISTING SVG
        ====================================================== */}

        <div
          ref={svgWrapRef}
          className="sketch-svg-wrap absolute inset-0 overflow-hidden"
        >

          <div
            className="absolute bottom-0 left-1/2 h-[720px] w-[1050px]"
            style={{
              transform:
                "translateX(-38%)",
            }}
          >

            <Group />

          </div>

        </div>

      </div>
    </>
  );
}