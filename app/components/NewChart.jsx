import * as d3 from "d3";
import {
  add,
  eachMonthOfInterval,
  endOfMonth,
  format,
  parse,
  parseISO,
  startOfMonth,
} from "date-fns";
import { motion } from "framer-motion";
import useMeasure from "react-use-measure";
import estimatedMax from "~/utils/estimated-max";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js";

let { colors } = resolveConfig(tailwindConfig).theme;

export default function NewChart({ entries }) {
  let [ref, bounds] = useMeasure();

  if (entries.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm italic text-gray-400">
          Lift some weight to see a chart!asdf
        </p>
      </div>
    );
  }
  // console.log(entries);

  let data = entries
    .sort((a, b) => (a.date > b.date ? 1 : -1))
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
  // const line = d3
  // .line()
  // .defined((i) => D[i])
  // .curve(curve)
  // .x((i) => xScale(X[i]))
  // .y((i) => yScale(Y[i]));

  // let d= line(I)
  // let data = [
  //   { date: parseISO("2022-05-21T00:00:00.000Z"), max: 10 },
  //   { date: parseISO("2022-05-22T00:00:00.000Z"), max: 20 },
  //   { date: parseISO("2022-05-23T00:00:00.000Z"), max: 30 },
  // ];

  let maxes = data.map((d) => d.estimatedMax);
  let margin = {
    top: 20,
    right: 20,
    bottom: 60,
    left: 20,
  };

  let startDay = startOfMonth(data[0].date);
  let endDay = endOfMonth(data[data.length - 1].date);

  let x = d3
    .scaleTime()
    .domain([startDay, endDay])
    .range([margin.left, bounds.width - margin.right]);

  let y = d3
    .scaleLinear()
    .domain([Math.min(...maxes), Math.max(...maxes)])
    .range([bounds.height - margin.bottom, margin.top]);

  console.log(data);
  console.log(y.ticks(4));

  // let axis = d3.axisBottom(x);
  // console.log(axis);

  // let xAxis = (g) =>
  //   g
  //     .attr("transform", `translate(0,${bounds.height - margin})`)
  //     .call(d3.axisBottom(x));
  // let xaxis = xAxis(data);
  // console.log({ xaxis });

  let line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.estimatedMax));
  let d = line(data);

  let months = eachMonthOfInterval({
    start: data[0].date,
    end: data[data.length - 1].date,
  });
  // let monthWidth = x(data[1].date) - x(data[0].date);

  return (
    <div className="relative h-full w-full" ref={ref}>
      <svg
        className="h-full w-full"
        viewBox={
          bounds.width === 0
            ? `0 0 0 0`
            : `0 0 ${bounds.width} ${bounds.height - margin.bottom}`
        }
      >
        {/* <line
          x1={0}
          x2={0}
          y1={0}
          y2={bounds.height}
          stroke={colors.gray[200]}
          strokeWidth={2}
        /> */}

        {/* <line
          x1={0}
          x2={bounds.width}
          y1={bounds.height}
          y2={bounds.height}
          stroke={colors.gray[200]}
          strokeWidth={2}
        /> */}

        {/* <g transform={`translateX(${})`}>

        </g> */}

        {/* X axis */}
        {months.map((month, i) => (
          <g key={i} transform={`translate(${x(month)},${bounds.height})`}>
            <line
              y1={-margin.bottom}
              y2={-bounds.height}
              stroke={colors.gray[100]}
              strokeWidth={2}
              // strokeDasharray={10}
            />
          </g>
        ))}
        <g transform={`translate(${x(endDay)},${bounds.height})`}>
          {/* <line
            y1={-margin.bottom}
            y2={-bounds.height}
            stroke={colors.gray[100]}
            strokeWidth={2}
            // strokeDasharray={10}
          /> */}
        </g>

        {/* Y axis */}
        {y.ticks(4).map((max, i) => (
          <g key={i} transform={`translate(0,${y(max)})`}>
            <line
              x1={margin.left}
              x2={bounds.width}
              stroke={colors.gray[100]}
              strokeWidth={2}
            />
            <text>{max}</text>
          </g>
        ))}

        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.75 }}
          d={d}
          stroke="currentColor"
          strokeWidth={2}
          fill="none"
          markerStart="url(#plot-marker-2)"
          markerMid="url(#plot-marker-2)"
          markerEnd="url(#plot-marker-2)"
        />

        {data.map((d, i) => (
          <motion.circle
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * (0.75 / data.length) }}
            key={d.date}
            r="5"
            cx={x(d.date)}
            cy={y(d.estimatedMax)}
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        ))}
      </svg>
      <div
        className="absolute inset-x-0 bottom-0 flex items-center justify-between"
        style={{ left: margin.left, right: margin.right }}
      >
        {months.map((month, i) => (
          <p className="w-full text-center text-xs text-gray-400" key={i}>
            {format(month, "MMM")}
          </p>
        ))}
      </div>
    </div>
  );
}
