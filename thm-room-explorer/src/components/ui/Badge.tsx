import { cn } from "@/lib/ui/cn";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

