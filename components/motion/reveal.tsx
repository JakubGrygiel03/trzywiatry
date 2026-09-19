"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { revealTransition, revealViewport } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Soft fade + slight rise — triggers early so lists never look “empty below”. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0.35, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={{ ...revealTransition, delay: Math.min(delay, 0.08) }}
    >
      {children}
    </motion.div>
  );
}
