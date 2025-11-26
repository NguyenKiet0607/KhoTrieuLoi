import { Variants } from "framer-motion"

/**
 * Reusable animation variants for consistent motion design
 */

// Fade animations
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
}

export const fadeOut: Variants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0, transition: { duration: 0.2 } },
}

// Slide animations
export const slideInRight: Variants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 30 },
    },
}

export const slideInLeft: Variants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 30 },
    },
}

export const slideInUp: Variants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 30 },
    },
}

export const slideInDown: Variants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 30 },
    },
}

// Scale animations
export const scaleIn: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { type: "spring", stiffness: 400, damping: 25 },
    },
}

export const scaleOut: Variants = {
    visible: { scale: 1, opacity: 1 },
    hidden: {
        scale: 0.8,
        opacity: 0,
        transition: { duration: 0.2 },
    },
}

// Bounce animation
export const bounceIn: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 500,
            damping: 15,
        },
    },
}

// Stagger children animation
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05,
        },
    },
}

export const staggerItem: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
}

// Card hover effect
export const cardHover: Variants = {
    rest: { scale: 1, y: 0 },
    hover: {
        scale: 1.02,
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 17 },
    },
}

// Button press effect
export const buttonPress: Variants = {
    rest: { scale: 1 },
    press: { scale: 0.95 },
}

// Modal backdrop
export const modalBackdrop: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
}

// Modal content
export const modalContent: Variants = {
    hidden: { scale: 0.9, opacity: 0, y: 20 },
    visible: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: {
        scale: 0.9,
        opacity: 0,
        y: 20,
        transition: { duration: 0.2 },
    },
}

// List item animation
export const listItem: Variants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i: number) => ({
        x: 0,
        opacity: 1,
        transition: {
            delay: i * 0.05,
            type: "spring",
            stiffness: 300,
            damping: 24,
        },
    }),
}

// Notification slide in
export const notification: Variants = {
    hidden: { x: 400, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
        x: 400,
        opacity: 0,
        transition: { duration: 0.2 },
    },
}

// Collapse/Expand
export const collapse: Variants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: {
        height: "auto",
        opacity: 1,
        transition: { duration: 0.3, ease: "easeInOut" },
    },
}

// Rotate animation
export const rotate: Variants = {
    rest: { rotate: 0 },
    spin: {
        rotate: 360,
        transition: { duration: 0.5, ease: "easeInOut" },
    },
}

// Pulse animation
export const pulse: Variants = {
    rest: { scale: 1 },
    pulse: {
        scale: [1, 1.05, 1],
        transition: { duration: 0.6, repeat: Infinity },
    },
}

// Shake animation
export const shake: Variants = {
    rest: { x: 0 },
    shake: {
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.4 },
    },
}

/**
 * Utility function for count-up animation
 */
export const countUpTransition = {
    duration: 2,
    ease: "easeOut",
}

/**
 * Page transition variants
 */
export const pageTransition: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
        opacity: 0,
        x: 20,
        transition: { duration: 0.2, ease: "easeIn" },
    },
}
