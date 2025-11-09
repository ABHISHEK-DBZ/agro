// Animation variants for consistent animations across the app
import { Variants } from 'framer-motion';

// Page transitions
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

// Fade in animation
export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.5 }
  },
  exit: { opacity: 0 },
};

// Slide up animation
export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 50 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    }
  },
};

// Scale animation
export const scaleVariants: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    }
  },
  tap: {
    scale: 0.95,
  }
};

// Card animation
export const cardVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    }
  },
  hover: {
    y: -5,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    transition: {
      duration: 0.2,
    }
  },
};

// Stagger children animation
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    }
  },
};

// List item animation
export const listItemVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
    }
  },
};

// Modal animation
export const modalVariants: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.9,
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: {
      duration: 0.2,
    }
  },
};

// Backdrop animation
export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.2,
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2,
    }
  },
};

// Button animation
export const buttonVariants: Variants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    }
  },
  tap: {
    scale: 0.95,
  }
};

// Icon animation (rotate)
export const iconRotateVariants: Variants = {
  initial: { rotate: 0 },
  animate: { 
    rotate: 360,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    }
  },
};

// Bounce animation
export const bounceVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 0, -10],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  },
};

// Pulse animation
export const pulseVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  },
};

// Shimmer loading animation
export const shimmerVariants: Variants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  },
};
