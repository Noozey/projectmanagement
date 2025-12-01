import { cn } from "@/lib/utils";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { type PointerEvent, type ReactNode } from "react";

// TODO: This is just a mock
function useTheme() {
  return { theme: "dark" };
}

type MagicCardProps = React.ComponentProps<typeof motion.div> & {
  gradientSize?: number;
  gradientColor?: string;
  gradientFrom?: string;
  gradientOpacity?: number;
  gradientTo?: string;
};

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "#262626",
  gradientOpacity = 0.5,
  gradientFrom = "var(--color-muted-foreground)",
  gradientTo = "var(--color-accent)",
  ...props
}: MagicCardProps) {
  const { theme } = useTheme();

  const hoverX = useMotionValue(0);
  const hoverY = useMotionValue(0);

  function handlePointerMove(e: PointerEvent) {
    if (!(e.target instanceof HTMLElement)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    hoverX.set(e.clientX - rect.left);
    hoverY.set(e.clientY - rect.top);
  }

  return (
    <motion.div
      className={cn("group relative rounded-[inherit]", className)}
      onPointerMove={handlePointerMove}
      {...props}
    >
      <motion.div
        className="magic-hover bg-border pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
          radial-gradient(${gradientSize}px circle at ${hoverX}px ${hoverY}px, ${theme == "light" ? "var(--primary)" : gradientFrom}, ${gradientTo}, var(--border) 100% )`,
        }}
      />
      <div className="bg-card absolute inset-px rounded-[inherit]" />
      <motion.div
        className="pointer-events-none absolute inset-px rounded-[inherit] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${hoverX}px ${hoverY}px, ${theme == "light" ? "color-mix(in oklab, var(--primary) 10%, transparent)" : gradientColor}, transparent 100%)
          `,
        }}
      />
      <div className="relative">{children as ReactNode}</div>
    </motion.div>
  );
}
