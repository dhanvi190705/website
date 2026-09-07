import { displayFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-4xl sm:text-5xl",
  };

  return (
    <span
      className={cn(
        displayFont.className,
        "font-bold uppercase tracking-tight text-neutral-50",
        sizes[size],
        className
      )}
    >
      AI <span className="text-gold-500">NEXT</span>
    </span>
  );
}
