import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border border-white/5 bg-card/80 p-6 backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.35)]",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card };
