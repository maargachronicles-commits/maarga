"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Group11 from "./assets/Group11";


/* ============================================================
   SVG ROW TOLERANCE
============================================================ */

const Y_BAND = 22;


/* ============================================================
   INTERSECTION TRIGGER
   ------------------------------------------------------------
   Drawing starts once 30% of Story 1 enters the viewport.
============================================================ */

const STORY_TRIGGER_THRESHOLD = 0.3;


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
    useRef<HTMLDivElement>(
      null
    );

  const svgWrapRef =
    useRef<HTMLDivElement>(
      null
    );

  const timelineRef =
    useRef<gsap.core.Timeline | null>(
      null
    );


  /*
   * Text is simply hidden until Story 1
   * enters the viewport by 30%.
   */
  const [textVisible, setTextVisible] =
    useState(false);


  /*
   * Prevent the trigger from firing
   * more than once.
   */
  const storyStartedRef =
    useRef(false);


  const textLines = [
    "We give you the person who can explain why a",
    "civilisation built it that way — a historian,",
    "an iconographer, a scholar who has spent decades",
    "earning the right to answer that question.",
  ];


  /* ============================================================
     BUILD SVG DRAWING
============================================================ */

  useEffect(() => {

    const wrap =
      svgWrapRef.current;

    if (!wrap) {
      return;
    }


    const svg =
      wrap.querySelector(
        "svg"
      );

    if (!svg) {
      return;
    }


    /* ----------------------------------------------------------
       1. COLLECT PATHS
    ---------------------------------------------------------- */

    let allPaths =
      Array.from(
        svg.querySelectorAll(
          "path"
        )
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
             * Degenerate paths remain
             * at origin.
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
       5. HIDE EVERY PATH
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
       6. BUILD GSAP DRAWING TIMELINE
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


              /*
               * Existing drawing duration.
               */
              const TARGET_DURATION =
                25.07;


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


    return () => {

      timelineRef.current =
        null;

      ctx.revert();

    };

  }, []);


  /* ============================================================
     30% VIEWPORT TRIGGER
============================================================ */

  useEffect(() => {

    const page =
      pageRef.current;

    if (!page) {
      return;
    }


    /*
     * If the story has already started,
     * don't create another observer.
     */
    if (
      storyStartedRef.current
    ) {
      return;
    }


    const observer =
      new IntersectionObserver(
        (
          entries
        ) => {

          const entry =
            entries[0];

          if (!entry) {
            return;
          }


          /*
           * Start once at 30% visibility.
           */
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >=
              STORY_TRIGGER_THRESHOLD
          ) {

            if (
              storyStartedRef.current
            ) {
              return;
            }


            storyStartedRef.current =
              true;


            /*
             * Show complete text.
             */
            setTextVisible(
              true
            );


            /*
             * Start SVG drawing.
             */
            if (
              timelineRef.current
            ) {

              timelineRef.current.play();

            }


            /*
             * We only need the first trigger.
             */
            observer.unobserve(
              page
            );

          }

        },
        {
          threshold:
            STORY_TRIGGER_THRESHOLD,
        }
      );


    observer.observe(
      page
    );


    return () => {

      observer.disconnect();

    };

  }, []);


  /* ============================================================
     SKIP
============================================================ */

  const handleSkip =
    () => {

      /*
       * Mark story as started.
       */
      storyStartedRef.current =
        true;


      /*
       * Show complete text.
       */
      setTextVisible(
        true
      );


      /*
       * Finish SVG immediately.
       */
      if (
        timelineRef.current
      ) {

        timelineRef.current.progress(
          1
        );

      }

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

        .story1-sketch path {
          fill: none !important;

          stroke-linecap: round;

          stroke-linejoin: round;
        }


        .story1-sketch path[fill="#A62F20"] {
          stroke: #A62F20;

          stroke-width: 0.8;
        }


        .story1-sketch path[fill="#272727"] {
          stroke: #272727;

          stroke-width: 1.9;
        }


        /* =====================================================
           TEXT SPAWN
        ===================================================== */

        .story1-text {
          opacity: 0;

          transform:
            translateY(12px);

          transition:
            opacity 500ms ease,
            transform 500ms ease;
        }


        .story1-text.is-visible {
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
            className="absolute left-[42%] top-[12%] text-[14px] text-[#666]"
          >
            1/3
          </div>


          {/* ====================================================
              MAIN TEXT
          ==================================================== */}

          <div
            className={`
              story1-text
              absolute
              left-[11%]
              top-[15%]
              w-[430px]
              ${
                textVisible
                  ? "is-visible"
                  : ""
              }
            `}
          >

            <div
              className="absolute left-[0%] top-[15%]"
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

          </div>


          {/* ====================================================
              BOTTOM INSTRUCTION
          ==================================================== */}

          <div
            className="absolute bottom-[3%] left-1/2 -translate-x-1/2"
          >

            <span
              className="text-[14px] italic text-[#666]"
            >
              Scroll down to go ahead
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
            SVG
        ====================================================== */}

        <div
          ref={svgWrapRef}
          className="story1-sketch absolute inset-0 overflow-hidden"
        >

          <div
            className="absolute bottom-0 left-1/2 h-[750px] w-[1100px]"
            style={{
              transform:
                "translateX(-35%)",
            }}
          >

            <Group11 />

          </div>

        </div>

      </div>
    </>
  );
}