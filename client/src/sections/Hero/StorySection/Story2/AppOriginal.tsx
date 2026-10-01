"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Group from "./assets/Group13";


/* ============================================================
   SVG ROW TOLERANCE
============================================================ */

const Y_BAND = 22;


/* ============================================================
   APP
============================================================ */

export default function App() {

  const pageRef =
    useRef<HTMLDivElement>(null);

  const svgWrapRef =
    useRef<HTMLDivElement>(null);

  const timelineRef =
    useRef<gsap.core.Timeline | null>(null);

  /*
   * Prevent the animation from being
   * started more than once.
   */
  const animationStartedRef =
    useRef(false);


  /*
   * Text simply spawns in.
   */
  const [textVisible, setTextVisible] =
    useState(false);


  const textShownRef =
    useRef(false);


  const textLines = [
    "We give you the person who can explain why a",
    "civilisation built it that way — a historian,",
    "an iconographer, a scholar who has spent decades",
    "earning the right to answer that question.",
  ];


  /* ============================================================
     BUILD SVG DRAWING TIMELINE
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
       COLLECT PATHS
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
       SPLIT COMPOUND PATHS
    ---------------------------------------------------------- */

    const expandedPaths:
      SVGPathElement[] = [];


    allPaths.forEach(
      (path) => {

        const d =
          path.getAttribute(
            "d"
          );


        if (!d) {

          expandedPaths.push(
            path
          );

          return;

        }


        const parts =
          d
            .split(
              /(?=[Mm])/
            )
            .map(
              (part) =>
                part.trim()
            )
            .filter(
              Boolean
            );


        if (
          parts.length <= 1
        ) {

          expandedPaths.push(
            path
          );

          return;

        }


        const parent =
          path.parentNode;


        if (!parent) {

          expandedPaths.push(
            path
          );

          return;

        }


        const newPaths =
          parts.map(
            (part) => {

              const clone =
                path.cloneNode(
                  false
                ) as SVGPathElement;


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


        expandedPaths.push(
          ...newPaths
        );

      }
    );


    allPaths =
      expandedPaths;


    /* ----------------------------------------------------------
       MEASURE PATHS
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
              bb.width / 2;


            cy =
              bb.y +
              bb.height / 2;


            len =
              Math.max(
                el.getTotalLength(),
                1
              );

          } catch {
            /*
             * Keep defaults.
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
       SORT TOP → BOTTOM / LEFT → RIGHT
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
          Math.abs(dy) >
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
       HIDE ALL PATHS
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
       BUILD GSAP TIMELINE
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


    return () => {

      timelineRef.current =
        null;

      ctx.revert();

    };

  }, []);


  /* ============================================================
     STORY 2 ENTRY TRIGGER
     ------------------------------------------------------------
     Story 2 starts when the Story 2 page itself enters the
     viewport as the user scrolls down from Story 1.
  ============================================================ */

  useEffect(() => {

    const page =
      pageRef.current;

    if (!page) {
      return;
    }


    if (
      animationStartedRef.current
    ) {
      return;
    }


    /*
     * Trigger when even a small part of Story 2
     * enters the viewport.
     *
     * This is effectively the hand-off from
     * Story 1 → Story 2.
     */
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


          if (
            entry.isIntersecting
          ) {

            if (
              animationStartedRef.current
            ) {
              return;
            }


            animationStartedRef.current =
              true;


            /*
             * Spawn complete text.
             */
            if (
              !textShownRef.current
            ) {

              textShownRef.current =
                true;

              setTextVisible(
                true
              );

            }


            /*
             * Start SVG drawing automatically.
             */
            if (
              timelineRef.current
            ) {

              timelineRef.current.play();

            }


            /*
             * Only trigger once.
             */
            observer.unobserve(
              page
            );

          }

        },
        {
          threshold:
            0.01,
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

      animationStartedRef.current =
        true;


      textShownRef.current =
        true;


      setTextVisible(
        true
      );


      if (
        timelineRef.current
      ) {

        timelineRef.current.progress(
          1
        );

      }


      /*
       * Tell StoryStack that Story 2
       * has been skipped.
       */
      window.dispatchEvent(
        new CustomEvent(
          "maarga-story-skip",
          {
            detail: {
              story: 2,
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

        .story2-text {
          opacity: 0;

          transform:
            translateY(12px);

          transition:
            opacity 500ms ease,
            transform 500ms ease;
        }


        .story2-text.is-visible {
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
            TEXT
        ====================================================== */}

        <div
          className="pointer-events-none absolute inset-0 z-30"
        >

          {/* SMALL HEADING */}

          <div
            className="absolute left-[11%] top-[12%] text-[14px] text-[#666]"
          >
            What is Maarga
          </div>


          {/* PAGE NUMBER */}

          <div
            className="absolute left-[42%] top-[12%] text-[14px] text-[#666]"
          >
            2/3
          </div>


          {/* ====================================================
              MAIN TEXT
          ==================================================== */}

          <div
            className={`
              story2-text
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
              className="absolute left-0 top-[15%]"
            >

              <div
                className="text-[20px] leading-[1.3] text-[#A62F20]"
              >

                {textLines.map(
                  (
                    line,
                    index
                  ) => (

                    <div
                      key={
                        index
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
            SVG DRAWING
        ====================================================== */}

        <div
          ref={svgWrapRef}
          className="sketch-svg-wrap absolute inset-0 overflow-hidden"
        >

          <div
            className="absolute bottom-0 left-1/2 h-[750px] w-[1100px]"
            style={{
              transform:
                "translateX(-35%)",
            }}
          >

            <Group />

          </div>

        </div>

      </div>
    </>
  );
}