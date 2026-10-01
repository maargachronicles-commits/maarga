"use client";

import "./assets/story3Sketch.css";

import { useRef } from "react";

import Group12 from "./assets/Group12";


export default function Story3SVG() {
    const containerRef = useRef<HTMLDivElement>(null);

  

    return (
        <div
            ref={containerRef}
            className="story3-sketch absolute inset-0 overflow-hidden"
        >
            <Group12 />
        </div>
    );
}