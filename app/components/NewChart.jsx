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
import estimatedMax from "~/utils/estimated-max";
import tailwindConfig from "../../tailwind.config.js";

let { colors } = resolveConfig(tailwindConfig).theme;

export default function NewChart({ entries }) {
  let [ref, bounds] = useMeasure();

  if (entries.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm italic text-gray-400">
          Lift some weight to see a chart!
        </p>
      </div>
    );
  }

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

  return (
    <div className="relative h-full w-full" ref={ref}>
      {bounds.width > 0 && (
        <Chart data={data} width={bounds.width} height={bounds.height} />
      )}
    </div>
  );
}

function Chart({ data, width, height }) {
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

  let y = d3
    .scaleLinear()
    .domain([Math.min(...maxes), Math.max(...maxes)])
    .range([height - margin.bottom, margin.top]);

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
  // monthWidth = monthWidth > 0 ? monthWidth : 0; // TODO: fix

  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`}>
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
          <g key={i} transform={`translate(${x(month)},0)`}>
            {i % 2 && (
              <motion.rect
                // initial={{ height: 0, y: 148 }}
                // animate={{ height: bounds.height - margin.bottom, y: 10 }}
                // initial={{ opacity: 0 }}
                // animate={{ opacity: 1 }}
                // transition={{ duration: 1 }}
                height={height - margin.top - margin.bottom + 10}
                y={margin.top - 5}
                width={x(endOfMonth(month)) - x(month)}
                fill={colors.gray[100]}
                // fill={colors.blue[50]}
              />
            )}
            {/* <line
              // y1={margin.bottom}
              // y1={0}
              y2={height - margin.bottom}
              stroke={colors.gray[100]}
              strokeWidth={2}
              // strokeDasharray={10}
            /> */}
          </g>
        ))}
        <g transform={`translate(${x(endDay)},${height})`}>
          {/* <line
            y1={-margin.bottom}
            y2={-height}
            stroke={colors.gray[100]}
            strokeWidth={2}
            // strokeDasharray={10}
          /> */}
        </g>

        {/* Y axis */}
        {y.ticks(4).map((max, i) => (
          <g key={i} transform={`translate(0,${y(max)})`}>
            <line
              x1={margin.left + 5}
              x2={width - margin.right}
              stroke={colors.gray[400]}
              // stroke={colors.blue[400]}
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

        {data.map((d, i) => (
          <motion.circle
            // initial={{ opacity: 0 }}
            // animate={{ opacity: 1 }}
            // transition={{ delay: i * (0.75 / data.length) }}
            key={d.date}
            r="5"
            cx={x(d.date)}
            cy={y(d.estimatedMax)}
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
    </>
  );
}
