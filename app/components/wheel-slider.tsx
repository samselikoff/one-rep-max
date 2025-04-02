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
import type { UIEvent } from "react";
import { useRef, useEffect } from "react";

export function WheelSlider({
  value,
  onChange = () => {},
  min,
  max,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const values = Array.from(
    { length: Math.floor((max - min) / step) + 1 },
    (_, i) => min + i * step
  );
  const selectedIndex = values.indexOf(value);

  const itemWidth = 40; // in pixels

  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft } = scrollContainerRef.current;
    const internalIndex = Math.floor(scrollLeft / itemWidth);
    const internalValue = values[internalIndex];

    if (internalValue !== value) {
      scrollContainerRef.current.scrollLeft =
        selectedIndex * itemWidth + itemWidth / 2;
    }
  }, [selectedIndex, value, values]);

  function handleScroll(e: UIEvent<HTMLDivElement, globalThis.UIEvent>) {
    if (!(e.target instanceof HTMLElement)) return;

    const { scrollLeft } = e.target;
    const newIndex = Math.max(
      Math.min(Math.floor(scrollLeft / itemWidth), values.length - 1),
      0
    );

    const newValue = values[newIndex];

    if (newValue !== value) {
      onChange(newValue);
    }
  }

  return (
    <div className="relative mx-auto w-full text-center">
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory snap-always overflow-x-auto pb-3 pl-[50%] pr-[50%]"
        >
          {values.map((value) => (
            <div
              key={value}
              className="flex shrink-0 snap-center flex-col items-center justify-end"
              style={{ width: itemWidth }}
            >
              <div className="relative mb-1 flex h-8 w-full items-end justify-center">
                <div className="h-1/2 w-px bg-gray-300" />
              </div>
              <span className="text-xs">{value}</span>
            </div>
          ))}
        </div>
        <div className="absolute left-1/2 top-0 h-8 w-[2px] -translate-x-1/2 transform bg-gray-700" />
      </div>
    </div>
  );
}
