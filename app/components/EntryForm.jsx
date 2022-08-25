import { Form } from "@remix-run/react";
import { format, formatDistanceToNow, parseISO, startOfToday } from "date-fns";
import { Fragment, useState } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { ResizablePanel } from "./ResizablePanel";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js";
import { v4 as uuid } from "uuid";
import estimatedMax from "~/utils/estimated-max";

let fullConfig = resolveConfig(tailwindConfig);
let colors = fullConfig.theme.colors;

export default function EntryForm({
  exercise,
  entry = null,
  lastEntry,
  lastTrackedEntry,
}) {
  let [sets, setSets] = useState(
    entry?.sets.length > 0
      ? entry.sets
      : [{ id: uuid(), weight: "", reps: "", tracked: false }]
  );
  let defaultDate = entry
    ? parseISO(entry.date.substring(0, 10))
    : startOfToday();

  let lastEstimatedMax;
  if (lastTrackedEntry) {
    let maxes = lastTrackedEntry.sets
      .filter((set) => set.tracked)
      .map((set) => estimatedMax(set));
    lastEstimatedMax = Math.max(...maxes);
  }

  return (
    <>
      <Form className="mt-4 space-y-4" method="post">
        <div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Date</span>
            <input
              defaultValue={format(defaultDate, "yyyy-MM-dd")}
              className="w-full border-gray-300"
              type="date"
              name="date"
            />
          </label>
        </div>

        <div>
          <ResizablePanel>
            <table>
              <thead>
                <tr className="text-left">
                  <th className="pb-2 pr-4 text-sm font-medium text-gray-700">
                    Sets
                  </th>
                  <th className="pb-2 text-sm font-medium text-gray-700">
                    Weight (lbs)
                  </th>
                  <th className="pb-2 text-sm font-medium text-gray-700">
                    Reps
                  </th>
                  <th className="whitespace-nowrap pl-4 pr-6 pb-2 text-sm font-medium text-gray-700">
                    Failure
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="pt-1">
                <AnimatePresence initial={false}>
                  {sets.map((set, index) => (
                    <Fragment key={set.id}>
                      <motion.tr
                        key={set.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          type: "linear",
                          duration: 0.2,
                          layout: {
                            type: "spring",
                            duration: 0.3,
                          },
                        }}
                      >
                        <td className="whitespace-nowrap text-sm font-medium text-gray-700">
                          {index + 1}
                        </td>
                        <td className="py-1 pr-2">
                          <div className="flex">
                            <input
                              type="text"
                              name="weight"
                              inputMode="decimal"
                              className="z-0 block w-full min-w-0 flex-1 border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              value={set.weight}
                              onChange={(e) => {
                                setSets((sets) => {
                                  let newSets = [...sets];
                                  let currentSet = newSets[index];
                                  newSets[index] = {
                                    ...currentSet,
                                    weight: e.target.value,
                                  };
                                  return newSets;
                                });
                              }}
                              placeholder="Weight"
                            />
                          </div>
                        </td>
                        <td className="pr-2">
                          <input
                            placeholder="Reps"
                            className="w-full border-gray-300"
                            type="text"
                            inputMode="numeric"
                            name="reps"
                            value={set.reps}
                            onChange={(e) => {
                              setSets((sets) => {
                                let newSets = [...sets];
                                let currentSet = newSets[index];
                                newSets[index] = {
                                  ...currentSet,
                                  reps: e.target.value,
                                };
                                return newSets;
                              });
                            }}
                          />
                        </td>
                        <td className="pr-2 text-center">
                          <input
                            type="checkbox"
                            name="trackingSet"
                            className="color-blue-500"
                            value={index}
                            checked={set.tracked}
                            onChange={(e) => {
                              setSets((sets) => {
                                let newSets = [
                                  ...sets.map((set, i) => {
                                    if (i === index) {
                                      set.tracked = !set.tracked;
                                    }
                                    return set;
                                  }),
                                ];
                                return newSets;
                              });
                            }}
                          />
                        </td>
                        <td
                          className={
                            sets.length === 1 ? "pointer-events-none" : ""
                          }
                        >
                          <AnimatedButton
                            onClick={(animationControls) => {
                              animationControls.start({
                                background: [
                                  colors.gray[300],
                                  colors.gray[100],
                                ],
                              });
                              setSets((sets) =>
                                sets.filter((s, i) => i !== index)
                              );
                            }}
                            className="h-10 w-10 rounded-md bg-gray-100"
                            type="button"
                          >
                            –
                          </AnimatedButton>
                        </td>
                      </motion.tr>
                      {set.tracked && set.weight && lastEstimatedMax && (
                        <motion.tr>
                          <td />
                          <td
                            colSpan={4}
                            className="pt-1 pb-4 text-left text-sm italic"
                          >
                            {repsToBeatMax(lastEstimatedMax, set.weight)} reps
                            at this weight to beat previous ORM
                          </td>
                        </motion.tr>
                      )}
                    </Fragment>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </ResizablePanel>

          <div className="mt-6">
            <AnimatedButton
              transition={{
                duration: 0.75,
                rotate: { ease: "anticipate" },
              }}
              onClick={(animationControls) => {
                animationControls.start({
                  background: [colors.gray[300], colors.gray[100]],
                });
                setSets((sets) => [
                  ...sets,
                  {
                    id: uuid(),
                    weight: sets[sets.length - 1].weight,
                    reps: sets[sets.length - 1].reps,
                    tracked: false,
                  },
                ]);
              }}
              type="button"
              className="h-11 w-full rounded-md bg-gray-100 text-sm font-medium text-gray-700"
            >
              + Add set
            </AnimatedButton>
          </div>
        </div>

        <div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-500">Notes</span>
            <textarea
              defaultValue={entry?.notes || ""}
              className="w-full border-gray-300"
              name="notes"
              rows={4}
            ></textarea>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-blue-500 px-5 py-2 font-medium text-white"
          >
            Save
          </button>
        </div>
      </Form>

      {lastEntry && (
        <div className="pt-4 pb-8">
          <div className="my-4 bg-gray-200 p-4 text-sm text-gray-700">
            <div className="flex justify-between">
              <p className="font-medium">Previous {exercise.name}</p>
              <p>
                {formatDistanceToNow(parseISO(lastEntry.date.substring(0, 10)))}{" "}
                ago
              </p>
            </div>
            <div className="mt-4">
              <ul>
                {lastEntry.sets.map((set) => (
                  <li key={set.id}>
                    {set.weight} lbs - {set.reps} reps
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AnimatedButton({ onClick, ...rest }) {
  const controls = useAnimation();

  return (
    <motion.button
      animate={controls}
      onClick={() => onClick(controls)}
      {...rest}
    />
  );
}

// function transparentize(hexColor, opacity) {
//   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
//   return result
//     ? `rgba(${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(
//         result[3],
//         16
//       )} / ${opacity})`
//     : null;
// }

function repsToBeatMax(max, weight) {
  let reps = (max - +weight) / (+weight * 0.0333);
  let repsToBeat = Math.ceil(reps);
  let newMax = estimatedMax({ weight, reps: repsToBeat });

  let x;
  if (newMax === max && repsToBeat > 0) {
    x = repsToBeat + 1;
  } else if (newMax > max && repsToBeat > 0) {
    x = repsToBeat;
  } else {
    x = 1;
  }

  return x;
}
