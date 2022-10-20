import { Form, useTransition } from "@remix-run/react";
import { format, formatDistanceToNow, parseISO, startOfToday } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import resolveConfig from "tailwindcss/resolveConfig";
import { v4 as uuid } from "uuid";
import estimatedMax, { repsFromEstimatedMax } from "~/utils/estimated-max";
import tailwindConfig from "../../tailwind.config.js";
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
      .filter((set) => set.tracked && set.reps > 0)
      .map((set) => estimatedMax(set));
    console.log({ maxes });
    lastEstimatedMax = Math.max(...maxes);
  }
  let { state } = useTransition();
  let isSaving = state === "submitting" || state === "loading";

  const [focusLastSet, setfocusLastSet] = useState(false);

  useEffect(() => {
    if (focusLastSet) {
      [...formRef.current.querySelectorAll("[name=weight]")].at(-1).focus();
      setfocusLastSet(false);
    }
  }, [focusLastSet]);

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
          <div>
            <div className="grid grid-cols-[40px_1fr_1fr_15%_15%] gap-x-2 text-sm font-medium text-gray-700">
              <div>Sets</div>
              <div>Weight (lbs)</div>
              <div>Reps</div>
              <div className="text-center">Failure</div>
            </div>

            <div className="overflow-hidden pt-3 pb-6">
              <AnimatePresence initial={false}>
                {sets.map((set, index) => (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      height: {
                        type: "spring",
                        duration: 0.3,
                      },
                      opacity: {
                        duration: 0.2,
                      },
                    }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-[40px_1fr_1fr_15%_15%] gap-x-2 pt-px pb-2">
                      <div className="flex items-center text-sm font-medium text-gray-700">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex">
                          <input
                            type="text"
                            name="weight"
                            inputMode="decimal"
                            className="z-0 block w-full min-w-0 flex-1 border-gray-300 px-3 py-2 sm:text-sm"
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
                    </div>
                    <AnimatePresence>
                      {set.tracked && set.weight && lastEstimatedMax && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{
                            height: {
                              type: "spring",
                              duration: 0.3,
                            },
                            opacity: {
                              duration: 0.2,
                            },
                          }}
                        >
                          <div className="pt-1 pb-4 text-center text-sm italic">
                            {repsToBeatMax(lastEstimatedMax, set.weight) ===
                            Infinity ? (
                              <p>Can't beat the previous 1RM at this weight!</p>
                            ) : (
                              <p>
                                {repsToBeatMax(lastEstimatedMax, set.weight)}{" "}
                                reps at this weight to beat previous 1RM
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div>
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
                    weight: "",
                    reps: sets[sets.length - 1].reps,
                    tracked: false,
                  },
                ]);

                setfocusLastSet(true);
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
            isSaving={isSaving}
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

function repsToBeatMax(max, weight) {
  let reps = repsFromEstimatedMax(max, weight);
  let repsToBeat = Math.max(Math.ceil(reps), 1);
  let newMax = estimatedMax({ weight, reps: repsToBeat });

  let x;
  if (newMax < max) {
    x = Infinity;
  } else if (newMax === max && repsToBeat > 0) {
    x = repsToBeat + 1;
  } else if (newMax > max && repsToBeat > 0) {
    x = repsToBeat;
  } else {
    x = 1;
  }

  return x;
}
