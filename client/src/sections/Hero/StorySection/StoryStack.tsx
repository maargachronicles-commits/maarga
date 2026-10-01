"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Story from "./Story";
import Story2 from "./Story2/Story2";
import Story3 from "./Story3/Story3";

gsap.registerPlugin(ScrollTrigger);

const STORY_COUNT = 3;
const SCROLL_STEPS_PER_STORY = 4;
const TOTAL_STEPS = STORY_COUNT * SCROLL_STEPS_PER_STORY;

export default function StoryStack() {
  const stackRef = useRef<HTMLDivElement>(null);
  const story1Ref = useRef<HTMLDivElement>(null);
  const story2Ref = useRef<HTMLDivElement>(null);
  const story3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    const storyRefs = [
      story1Ref.current,
      story2Ref.current,
      story3Ref.current,
    ];

    const snapPoints = Array.from(
      { length: TOTAL_STEPS + 1 },
      (_, index) => index / TOTAL_STEPS
    );

    const setActiveStory = (storyNumber: number) => {
      storyRefs.forEach((story, index) => {
        if (!story) return;

        const isActive = index + 1 === storyNumber;

        // The current story comes to the front.
        // Completed stories remain mounted underneath it.
        story.style.zIndex = isActive
          ? String(30)
          : String(20 - index);
      });
    };

    setActiveStory(1);

    const trigger = ScrollTrigger.create({
      trigger: stack,
      start: "top top",
      end: "+=1200vh",
      pin: true,
      scrub: true,

      snap: {
        snapTo: snapPoints,
        duration: 0.35,
        ease: "power2.out",
      },

      onUpdate: (self) => {
        const globalProgress = Math.max(
          0,
          Math.min(1, self.progress)
        );

        // Work out which story owns the current section.
        const storyIndex = Math.min(
          STORY_COUNT - 1,
          Math.floor(globalProgress * STORY_COUNT)
        );

        const storyNumber = storyIndex + 1;

        // Progress inside the active story: 0 → 1.
        const storyStart = storyIndex / STORY_COUNT;
        const storyEnd = (storyIndex + 1) / STORY_COUNT;

        const storyProgress =
          storyIndex === STORY_COUNT - 1
            ? (globalProgress - storyStart) /
              (1 - storyStart)
            : (globalProgress - storyStart) /
              (storyEnd - storyStart);

        setActiveStory(storyNumber);

        window.dispatchEvent(
          new CustomEvent("maarga-story-progress", {
            detail: {
              story: storyNumber,
              progress: Math.max(
                0,
                Math.min(1, storyProgress)
              ),
            },
          })
        );
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <section
      ref={stackRef}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Story 1 — initially on top */}
      <div
        ref={story1Ref}
        className="absolute inset-0 h-screen w-full"
        style={{ zIndex: 30 }}
      >
        <Story />
      </div>

      {/* Story 2 — underneath Story 1 */}
      <div
        ref={story2Ref}
        className="absolute inset-0 h-screen w-full"
        style={{ zIndex: 20 }}
      >
        <Story2 />
      </div>

      {/* Story 3 — underneath Story 2 */}
      <div
        ref={story3Ref}
        className="absolute inset-0 h-screen w-full"
        style={{ zIndex: 10 }}
      >
        <Story3 />
      </div>
    </section>
  );
}