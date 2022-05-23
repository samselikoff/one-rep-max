import * as Plot from "@observablehq/plot";
import { format, parseISO } from "date-fns";
import { useEffect, useRef } from "react";
import useMeasure from "react-use-measure";
import estimatedMax from "~/utils/estimated-max";

export default function Chart({ entries }) {
  let chartRef = useRef();
  let [containerRef, bounds] = useMeasure();

  let allMaxes = entries
    .map((entry) => {
      let setWithhighestEstimatedMax = entry.sets
        .filter((set) => set.reps > 0 && set.tracked)
        .sort((a, b) => estimatedMax(b) - estimatedMax(a))[0];

      return {
        date: parseISO(entry.date),
        estimatedMax: setWithhighestEstimatedMax
          ? estimatedMax(setWithhighestEstimatedMax)
          : null,
      };
    })
    .filter((s) => s.estimatedMax);

  useEffect(() => {
    let chart = Plot.plot({
      width: bounds.width,
      height: bounds.height,
      marginLeft: 30,
      marginRight: 10,
      x: {
        tickFormat: (d) => format(d, "MMM d"),
      },
      y: {
        label: null,
        grid: true,
        labelOffset: 28,
        tickSize: 0,
      },
      marks: [
        Plot.line(allMaxes, {
          x: "date",
          y: "estimatedMax",
          stroke: "#0ea5e9",
          strokeWidth: 2,
          marker: "circle",
        }),
      ],
    });

    chartRef.current.append(chart);
    return () => chart.remove();
  }, [allMaxes, bounds.height, bounds.width]);

  return (
    <div className="h-40 w-full" ref={containerRef}>
      <div ref={chartRef} />
    </div>
  );
}
