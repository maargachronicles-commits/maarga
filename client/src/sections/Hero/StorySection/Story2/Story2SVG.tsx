"use client";

import "./assets/story2Sketch.css";

import { useRef } from "react";

import Group13 from "./assets/Group13";


export default function Story2SVG() {
    const containerRef = useRef<HTMLDivElement>(null);

  

    return (
        <div
            ref={containerRef}
            className="story2-sketch absolute inset-0 overflow-hidden"
        >
            <Group13 />
        </div>
    );
}