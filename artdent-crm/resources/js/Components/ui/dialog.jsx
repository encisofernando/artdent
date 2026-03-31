import * as React from "react"
import { extendTailwindMerge } from "tailwind-merge"
import { clsx } from "clsx"

export function cn(...inputs) {
  return clsx(inputs)
}

const Dialog = ({ open, onOpenChange, children }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => onOpenChange(false)}
            />
            <div className="relative z-50 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {children}
            </div>
        </div>
    );
};

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative flex flex-col shadow-lg overflow-hidden sm:rounded-2xl rounded-t-2xl w-full",
            className
        )}
        {...props}
    >
        {children}
    </div>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }) => (
    <div
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-slate-500", className)}
        {...props}
    />
))
DialogDescription.displayName = "DialogDescription"

const DialogFooter = ({ className, ...props }) => (
    <div
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
        {...props}
    />
)
DialogFooter.displayName = "DialogFooter"

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
