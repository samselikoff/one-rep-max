import { Form } from "@remix-run/react";
import { format, formatDistanceToNow, parseISO, startOfToday } from "date-fns";
import { Fragment, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ResizablePanel } from "./ResizablePanel";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js";
import { v4 as uuid } from "uuid";
import estimatedMax from "~/utils/estimated-max";
import AnimatedButton from "./AnimatedButton";

let fullConfig = resolveConfig(tailwindConfig);
let colors = fullConfig.theme.colors;

export default function EntryForm({
  exercise,
  entry = null,
  lastEntry,
  lastTrackedEntry,
}) {
  let formRef = useRef();
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
      <Form className="mt-4 space-y-4" method="post" ref={formRef}>
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
            <div>
              <div className="grid grid-cols-[40px_25%_25%_15%_15%] gap-x-2 text-sm font-medium text-gray-700">
                <div>Sets</div>
                <div>Weight (lbs)</div>
                <div>Reps</div>
                <div className="text-center">Failure</div>
              </div>
              <div className="mt-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {sets.map((set, index) => (
                    <motion.div
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
                      <motion.div
                        layout
                        className="grid grid-cols-[40px_25%_25%_15%_15%] gap-x-2 pb-2"
                      >
                        <div className="flex items-center text-sm font-medium text-gray-700">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex">
                            <input
                              type="text"
                              name="weight"
                              autoFocus
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
                        </div>
                        <div>
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
                        </div>
                        <div className="flex items-center justify-center text-center">
                          <input
                            type="checkbox"
                            name="trackingSet"
                            className="color-blue-500"
                            value={index}
                            checked={set.tracked}
                            onChange={(e) => {
                              setSets((sets) =>
                                sets.map((set, i) => ({
                                  ...set,
                                  tracked:
                                    i === index ? !set.tracked : set.tracked,
                                }))
                              );
                            }}
                          />
                        </div>
                        <div className="text-right">
                          <AnimatedButton
                            disabled={sets.length === 1}
                            backgroundColor={colors.gray[100]}
                            highlightColor={colors.gray[300]}
                            onClick={() => {
                              setSets((sets) =>
                                sets.filter((s, i) => i !== index)
                              );
                            }}
                            className="h-10 w-10 rounded-md bg-gray-100"
                            type="button"
                          >
                            –
                          </AnimatedButton>
                        </div>
                      </motion.div>
                      <AnimatePresence mode="popLayout">
                        {set.tracked && set.weight && lastEstimatedMax && (
                          <motion.div exit={{ opacity: 0 }}>
                            <div className="pt-1 pb-4 text-center text-sm italic">
                              {repsToBeatMax(lastEstimatedMax, set.weight)} reps
                              at this weight to beat previous ORM
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </ResizablePanel>

          <div className="mt-6">
            <AnimatedButton
              backgroundColor={colors.gray[100]}
              highlightColor={colors.gray[300]}
              transition={{
                duration: 0.75,
              }}
              onClick={() => {
                setSets((sets) => [
                  ...sets,
                  {
                    id: uuid(),
                    weight: sets[sets.length - 1].weight,
                    reps: sets[sets.length - 1].reps,
                    tracked: false,
                  },
                ]);

                // TODO: focus new set's weight?
                // [...formRef.current.querySelectorAll("[name=weight]")]
                //   .at(-1)
                //   .focus();
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
          <AnimatedButton
            type="submit"
            backgroundColor={colors.blue[500]}
            highlightColor={colors.blue[600]}
            className="rounded-md px-5 py-2 font-medium text-white"
          >
            Save
          </AnimatedButton>
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

// function AnimatedButton({ onClick, ...rest }) {
//   const controls = useAnimation();

//   return (
//     <motion.button
//       animate={controls}
//       onClick={(event) => onClick(event, controls)}
//       {...rest}
//     />
//   );
// }

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
