import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import useMeasure from "react-use-measure";

export type DivProps = React.ComponentProps<"div"> & {
  children?: ReactNode;
  rootProps?: React.ComponentProps<typeof motion.div>;
};

export function AutoResizeDiv({
  children,
  ref,
  rootProps,
  ...props
}: DivProps) {
  const [measureRef, { height }] = useMeasure();
  return (
    <motion.div
      ref={ref}
      layout
      data-slot="auto-resize-box-root"
      {...rootProps}
      className={cn("flex-1 overflow-hidden", rootProps?.className)}
      animate={{ height }}
    >
      <div data-slot="auto-resize-box" ref={measureRef} {...props}>
        {children}
      </div>
    </motion.div>
  );
}

AutoResizeDiv.displayName = "Div";
