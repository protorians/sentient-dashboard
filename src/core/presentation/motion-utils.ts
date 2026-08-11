// src/core/presentation/motion-utils.ts
// Motion utilities for elastic, organic, and spring-based animations

import { motion, Variants } from "framer-motion";
import { tokens } from "./design-system";

const { springStiffness, springDamping } = tokens.motion;
const stiffness = springStiffness;
const damping = springDamping;
const spring = { type: "spring" as const, stiffness, damping };
const springSoft = { type: "spring" as const, stiffness: stiffness * 0.6, damping: damping * 1.3 };
const springBouncy = { type: "spring" as const, stiffness: stiffness * 1.3, damping: damping * 0.7 };

export const elasticEnter = (exitDelay: number = 0): Variants => ({
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: spring },
  exit: {
    opacity: 0, y: -20, scale: 0.95,
    transition: { ...springSoft, delay: exitDelay },
  },
});

export const elasticExit = (): Variants => ({
  initial: { opacity: 1, y: 0, scale: 1 },
  animate: { opacity: 0, y: -20, scale: 0.95, transition: springSoft },
});

export const elasticPulse = (): Variants => ({
  initial: { scale: 1 },
  animate: { scale: 1.05 },
  transition: { ...spring, repeat: Infinity, repeatType: "reverse" as const },
});

export const elasticScaleEnter = (): Variants => ({
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: springBouncy },
  exit: { opacity: 0, scale: 0.92, transition: springSoft },
});

export const elasticSlideUp = (delay: number = 0): Variants => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { ...spring, delay } },
  exit: { opacity: 0, y: -30, transition: springSoft },
});

export const elasticSlideInLeft = (): Variants => ({
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0, transition: spring },
  exit: { opacity: 0, x: 40, transition: springSoft },
});

export const elasticSlideInRight = (): Variants => ({
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: spring },
  exit: { opacity: 0, x: -40, transition: springSoft },
});

export const elasticContainer = (delay: number = 0, stagger: number = 0.08): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      ...spring,
      delay,
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      ...springSoft,
      staggerChildren: 0.04,
      staggerDirection: -1,
      delayChildren: 0,
    },
  },
});

export const elasticChild = (): Variants => ({
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: spring },
  exit: { opacity: 0, y: -15, scale: 0.95, transition: springSoft },
});

export const elasticHover = (scale: number = 1.02) => ({
  whileHover: { scale, transition: springBouncy },
  whileTap: { scale: 0.97, transition: springSoft },
});

export const elasticTap = () => ({
  whileTap: { scale: 0.94, transition: springSoft },
});

export const staggeredSpringList = (motionConfig: {
  delay: number;
  stiffness?: number;
  damping?: number;
}) => {
  const { delay, stiffness: s = stiffness, damping: d = damping } = motionConfig;

  return {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ...spring, delay, staggerChildren: 0.1 } },
    exit: {
      opacity: 0, y: -20,
      transition: { ...springSoft, delay, staggerChildren: 0.1 },
    },
  };
};
