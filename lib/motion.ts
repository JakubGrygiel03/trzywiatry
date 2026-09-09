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
  duration: 0.55,
  ease: motionEase,
};

/** Soft photo crossfade for hero / gallery slots. */
export const crossfadeTransition = {
  duration: 1.15,
  ease: motionEase,
};

export const revealViewport = { once: true, margin: "-8% 0px" as const };
