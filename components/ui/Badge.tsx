import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-sm",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-sm",
                outline: "text-foreground border-current",
                success:
                    "border-transparent bg-success text-success-foreground hover:bg-success/80 shadow-sm",
                warning:
                    "border-transparent bg-warning text-warning-foreground hover:bg-warning/80 shadow-sm",
                info:
                    "border-transparent bg-info text-info-foreground hover:bg-info/80 shadow-sm",
                gradient:
                    "border-transparent bg-gradient-to-r from-primary-from to-primary-to text-white shadow-md hover:shadow-glow",
            },
            size: {
                default: "px-2.5 py-0.5 text-xs",
                sm: "px-2 py-0 text-[10px]",
                lg: "px-3 py-1 text-sm",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    dot?: boolean
}

function Badge({ className, variant, size, dot, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
            {dot && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current" />}
            {props.children}
        </div>
    )
}

export { Badge, badgeVariants }
