import { motion } from "framer-motion";
import useMeasure from "react-use-measure";

export function ResizablePanel({ children }) {
  let [ref, { height }] = useMeasure();

  return (
    <motion.div
      animate={height ? { height } : {}}
      style={height ? { height } : {}}
      className="relative w-full overflow-hidden"
      transition={{ type: "spring", duration: 0.3 }}
    >
      <div ref={ref} className={height ? "absolute" : "relative"}>
        {children}
      </div>
    </motion.div>
  );
}
