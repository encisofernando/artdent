import * as React from "react"
import { cn } from "@/lib/utils"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
}

export function Button({ className, variant="default", size="md", ...props }: Props) {
  const v = {
    default: "bg-artdent-blue text-white hover:opacity-90",
    secondary: "bg-artdent-mint text-slate-900 hover:opacity-90",
    outline: "border border-slate-300 hover:bg-slate-50",
    ghost: "hover:bg-slate-100",
    destructive: "bg-red-600 text-white hover:opacity-90",
  }[variant]

  const s = { sm:"h-9 px-3 text-sm", md:"h-10 px-4", lg:"h-11 px-6 text-base" }[size]

  return (
    <button
      className={cn("inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-artdent-mint disabled:opacity-50", v, s, className)}
      {...props}
    />
  )
}
