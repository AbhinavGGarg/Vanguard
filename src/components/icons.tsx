import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/vanguard-mark.svg"
      alt="Vanguard logo"
      className={cn("h-8 w-8 object-contain", className)}
    />
  );
}
