/** Shared motion tokens — subtle, atelier-like, never flashy. */
export const motionEase = [0.22, 1, 0.36, 1] as const;

export const fadeTransition = {
  duration: 0.35,
  ease: motionEase,
};

export const drawerTransition = {
  duration: 0.38,
  ease: motionEase,
};

export const revealTransition = {
  duration: 0.22,
  ease: motionEase,
};

/** Soft photo crossfade for hero / gallery slots. */
export const crossfadeTransition = {
  duration: 1.15,
  ease: motionEase,
};

/**
 * Reveal early — positive bottom margin grows the “in view” zone below the fold
 * so the next row is already visible before the customer thinks the list ended.
 */
export const revealViewport = {
  once: true,
  amount: 0.01,
  margin: "0px 0px 35% 0px" as const,
};
