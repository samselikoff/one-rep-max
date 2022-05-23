import * as Plot from "@observablehq/plot";
import { format, parseISO } from "date-fns";
import { useEffect, useRef } from "react";
import useMeasure from "react-use-measure";
import estimatedMax from "~/utils/estimated-max";

export default function Chart({ entries }) {
  let chartRef = useRef();
  let [containerRef, bounds] = useMeasure();

  // console.log(entries);
  let allMaxes = entries
    .map((entry) => {
      let setWithhighestEstimatedMax = entry.sets
        .filter((set) => set.reps > 0)
        .sort((a, b) => {
          return estimatedMax(a) > estimatedMax(b) ? -1 : 1;
        })[0];

      return {
        date: parseISO(entry.date),
        estimatedMax: setWithhighestEstimatedMax
          ? estimatedMax(setWithhighestEstimatedMax)
          : null,
      };
    })
    .filter((s) => s.estimatedMax);

  useEffect(() => {
    console.log(allMaxes);
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

// let trackingSets = [
//   { date: "2022-01-20T00:00:00.000Z", max: 165 },
//   { date: "2022-01-21T00:00:00.000Z", max: 175 },
//   { date: "2022-01-28T00:00:00.000Z", max: 185 },
//   { date: "2022-02-02T00:00:00.000Z", max: 215 },
//   { date: "2022-02-06T00:00:00.000Z", max: 225 },
//   { date: "2022-02-08T00:00:00.000Z", max: 225 },
// ].map((d) => {
//   // let xyz = utcToZonedTime(d.date, timeZone);
//   // debugger;
//   // d.date = utcToZonedTime(d.date, timeZone);
//   // d.date = utcToZonedTime(parseISO(d.date), timeZone);
//   d.date = parseISO(d.date.slice(0, 10));
//   return d;
// });

// let data = eachDayOfInterval({
//   start: trackingSets[0].date,
//   end: trackingSets[trackingSets.length - 1].date,
// }).map((day) => {
//   // console.log(day);
//   // debugger;
//   return {
//     date: day,
//     max: trackingSets.find((s) => isEqual(s.date, day))?.max,
//   };
// });
// let data = trackingSets;
