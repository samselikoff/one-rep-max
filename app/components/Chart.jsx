import * as d3 from "d3";
import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
} from "date-fns";
import { motion } from "framer-motion";
import useMeasure from "react-use-measure";
import resolveConfig from "tailwindcss/resolveConfig";
// import estimatedMax from "~/utils/estimated-max";
import tailwindConfig from "../../tailwind.config.js";

let { colors } = resolveConfig(tailwindConfig).theme;

export default function Chart({ entries }) {
  let [ref, bounds] = useMeasure();

  // Total weight
  if (!entries.flatMap((entry) => entry.sets).some((set) => set.reps > 0)) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm italic text-gray-400">
          Add a set to see a chart!
        </p>
      </div>
    );
  }

  let data = [...entries]
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .map((entry) => {
      let value = entry.sets.reduce((memo, set) => {
        return memo + set.reps * set.weight;
      }, 0);

      return {
        date: parseISO(entry.date),
        value,
      };
    })
    .filter((s) => s.value);

  return (
    <div className="relative h-full w-full" ref={ref}>
      {bounds.width > 0 && (
        <ChartInner data={data} width={bounds.width} height={bounds.height} />
      )}
    </div>
  );

  // One rep max
  // if (
  //   !entries
  //     .flatMap((entry) => entry.sets)
  //     .some((set) => set.reps > 0 && set.tracked)
  // ) {
  //   return (
  //     <div className="flex h-full w-full items-center justify-center">
  //       <p className="text-sm italic text-gray-400">
  //         Add a tracked set to see a chart!
  //       </p>
  //     </div>
  //   );
  // }

  // let data = [...entries]
  //   .sort((a, b) => (a.date > b.date ? 1 : -1))
  //   .map((entry) => {
  //     let setWithHighestEstimatedMax = entry.sets
  //       .filter((set) => set.reps > 0 && set.tracked)
  //       .sort((a, b) => estimatedMax(b) - estimatedMax(a))[0];

  //     return {
  //       date: parseISO(entry.date),
  //       value: setWithHighestEstimatedMax
  //         ? estimatedMax(setWithHighestEstimatedMax)
  //         : null,
  //     };
  //   })
  //   .filter((s) => s.value);

  // return (
  //   <div className="relative h-full w-full" ref={ref}>
  //     {bounds.width > 0 && (
  //       <ChartInner data={data} width={bounds.width} height={bounds.height} />
  //     )}
  //   </div>
  // );
}

function ChartInner({ data, width, height }) {
  let maxes = data.map((d) => d.value);
  let margin = {
    top: 20,
    right: 0,
    bottom: 30,
    left: 25,
  };

  let startDay = startOfMonth(data[0].date);
  let endDay = endOfMonth(data[data.length - 1].date);

  let x = d3
    .scaleTime()
    .domain([startDay, endDay])
    .range([margin.left, width - margin.right]);

  let yMax = Math.max(...maxes);
  let yMin = Math.min(...maxes);
  if (yMin === yMax) {
    yMin = 0;
  }
  let y = d3
    .scaleLinear()
    .domain([yMin, yMax])
    .range([height - margin.bottom, margin.top]);

  let line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.value));
  let d = line(data);

  let months = eachMonthOfInterval({
    start: data[0].date,
    end: data[data.length - 1].date,
  });

  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`}>
        {/* X axis */}
        {months.map((month, i) => (
          <g key={i} transform={`translate(${x(month)},0)`}>
            {i % 2 && (
              <motion.rect
                height={height - margin.top - margin.bottom + 10}
                y={margin.top - 5}
                width={x(endOfMonth(month)) - x(month)}
                fill={colors.gray[100]}
              />
            )}
            <text
              x={(x(endOfMonth(month)) - x(month)) / 2}
              y={height - 5}
              fill={colors.gray[400]}
              className="w-full text-center text-xs"
              textAnchor="middle"
            >
              {format(month, "MMM")}
            </text>
          </g>
        ))}

        {/* Y axis */}
        {y.ticks(4).map((max, i) => (
          <g key={i} transform={`translate(0,${y(max)})`}>
            <line
              x1={margin.left}
              x2={width - margin.right}
              stroke={colors.gray[400]}
              strokeWidth={1}
              strokeDasharray="1,3"
              strokeDashoffset={10}
            />
            <text
              fill={colors.gray[400]}
              className="text-xs"
              alignmentBaseline="middle"
            >
              {max}
            </text>
          </g>
        ))}

        {/* Line */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            type: "spring",
            duration: 1.85,
            bounce: 0.1,
            delay: 0.1,
          }}
          d={d}
          stroke="currentColor"
          strokeWidth={2}
          fill="none"
        />

        {/* Line */}
        {data.map((d, i) => (
          <motion.circle
            key={i}
            r="5"
            cx={x(d.date)}
            cy={y(d.value)}
            fill="currentColor"
            stroke={
              months.findIndex((m) => isSameMonth(m, d.date)) % 2 === 0
                ? "white"
                : colors.gray[100]
            }
            strokeWidth={2}
          />
        ))}
      </svg>
    </>
  );
}
