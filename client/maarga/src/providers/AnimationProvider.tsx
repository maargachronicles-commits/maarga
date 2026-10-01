"use client";

import { ReactNode } from "react";

interface AnimationProviderProps {
  children: ReactNode;
}

export default function AnimationProvider({
  children,
}: AnimationProviderProps) {
  return <>{children}</>;
}