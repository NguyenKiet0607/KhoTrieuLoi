import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

const cardVariants = cva(
    "rounded-xl border text-card-foreground transition-all duration-300",
    {
        variants: {
            variant: {
                default: "bg-card shadow-sm hover:shadow-elevated",
                glass: "glass shadow-glass hover:shadow-glow",
                gradient: "gradient-primary-hover text-white border-transparent shadow-lg",
                elevated: "bg-card shadow-elevated hover:shadow-glow",
                bordered: "bg-card border-2 hover:border-primary/50",
                hoverable: "bg-card shadow-sm hover:shadow-lg hover:scale-[1.02]",
                interactive: "bg-card shadow-sm hover:shadow-elevated hover:border-primary cursor-pointer",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface CardProps
    extends Omit<HTMLMotionProps<"div">, "ref">,
    VariantProps<typeof cardVariants> {
    disableAnimation?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, disableAnimation = false, ...props }, ref) => {
        if (disableAnimation) {
            return (
                <div
                    ref={ref}
                    className={cn(cardVariants({ variant }), className)}
                    {...(props as any)}
                />
            )
        }

        return (
            <motion.div
                ref={ref}
                className={cn(cardVariants({ variant }), className)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{
                    y: -4,
                    transition: { type: "spring", stiffness: 400, damping: 17 },
                }}
                {...props}
            />
        )
    }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-2xl font-bold leading-none tracking-tight",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

