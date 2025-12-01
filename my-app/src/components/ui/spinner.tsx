import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <motion.span
      initial={{ width: 0, scale: 0 }}
      animate={{ width: "auto", scale: 1 }}
      exit={{ width: 0, scale: 0 }}
    >
      <Loader2Icon
        role="status"
        aria-label="Loading"
        className={cn("size-4 animate-spin", className)}
        {...props}
      />
    </motion.span>
  );
}

export { Spinner };
