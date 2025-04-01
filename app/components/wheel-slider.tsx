// import { motion } from "framer-motion";

// export function WheelSlider() {
//   return (
//     <motion.div drag="x" className="flex justify-between">
//       {Array.from(Array(10).keys()).map((i) => (
//         <span className="inline-block h-4 w-[2px] bg-gray-300" key={i} />
//       ))}
//     </motion.div>
//   );
// }
import { useState, useRef, useEffect } from "react";

export function WheelSlider({
  value,
  onChange = () => {},
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  // const [value, setValue] = useState(70);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const itemCount = 101; // 0 through 100
  const itemWidth = 40; // in pixels

  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft } = scrollContainerRef.current;
    const internalValue = Math.floor(scrollLeft / itemWidth);
    if (internalValue !== value) {
      scrollContainerRef.current.scrollLeft = value * itemWidth + itemWidth / 2;
    }
  }, [value]);

  const handleScroll = (e) => {
    const { scrollLeft } = e.target;
    const newValue = Math.floor(scrollLeft / itemWidth);

    if (newValue !== value) {
      onChange(newValue);
    }
  };

  return (
    <div className="relative mx-auto w-full text-center">
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory snap-always overflow-x-auto pb-3 pl-[50%] pr-[50%]"
        >
          {Array.from({ length: itemCount }).map((_, i) => (
            <div
              key={i}
              className="flex shrink-0 snap-center flex-col items-center justify-end"
              style={{ width: itemWidth }}
            >
              <div className="relative mb-1 flex h-8 w-full items-end justify-center">
                <div className="h-1/2 w-px bg-gray-400" />
              </div>
              <span className="text-xs">{i}</span>
            </div>
          ))}
        </div>
        <div className="absolute left-1/2 top-0 h-8 w-[2px] -translate-x-1/2 transform bg-red-500" />
      </div>
    </div>
  );
}
