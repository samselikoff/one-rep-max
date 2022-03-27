import { format, formatDistanceToNow, parseISO, startOfToday } from "date-fns";
import { useState } from "react";
import { Form } from "remix";

export default function EntryForm({ exercise, entry = null, lastEntry }) {
  let [sets, setSets] = useState(
    entry?.sets.length > 0 ? entry.sets : [{ weight: "", reps: "" }]
  );
  let defaultDate = entry
    ? parseISO(entry.date.substring(0, 10))
    : startOfToday();

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
          <div className="space-y-2">
            <ol className="space-y-2 list-decimal list-inside">
              {sets.map((set, index) => (
                <li key={index + 1} className="flex items-center space-x-3">
                  <span className="flex-1 text-sm font-medium text-gray-700 whitespace-nowrap">
                    Set {index + 1}
                  </span>
                  <div className="w-full">
                    <div>
                      <div className="flex">
                        <input
                          type="text"
                          name="weight"
                          className="z-0 flex-1 block w-full min-w-0 px-3 py-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={set.weight}
                          onChange={(e) => {
                            setSets((sets) => {
                              let newSets = [...sets];
                              let currentSet = newSets[index];
                              newSets[index] = {
                                weight: e.target.value,
                                reps: currentSet.reps,
                              };

                              return newSets;
                            });
                          }}
                          placeholder="Weight"
                        />
                        <span className="inline-flex items-center px-3 text-gray-500 border border-l-0 border-gray-300 bg-gray-50 sm:text-sm">
                          lbs
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full">
                    <input
                      placeholder="Reps"
                      className="w-full border-gray-300"
                      type="number"
                      name="reps"
                      value={set.reps}
                      onChange={(e) => {
                        setSets((sets) => {
                          let newSets = [...sets];
                          let currentSet = newSets[index];
                          newSets[index] = {
                            weight: currentSet.weight,
                            reps: e.target.value,
                          };

                          return newSets;
                        });
                      }}
                    />
                  </div>

                  <div
                    className={`${
                      sets.length === 1 ? "pointer-events-none opacity-0" : ""
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSets((sets) => sets.filter((s, i) => i !== index));
                      }}
                      className="px-3 py-2 bg-gray-100"
                      type="button"
                    >
                      –
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-6">
            <button
              onClick={() =>
                setSets((sets) => [
                  ...sets,
                  {
                    weight: sets[sets.length - 1].weight,
                    reps: sets[sets.length - 1].reps,
                  },
                ])
              }
              type="button"
              className="w-full text-sm font-medium text-gray-900 bg-gray-300 h-11"
            >
              + Add set
            </button>
          </div>
        </div>

        <div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-500">Notes</span>
            <textarea
              defaultValue={entry?.notes || ""}
              className="w-full"
              name="notes"
              rows={4}
            ></textarea>
          </label>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-5 py-2 text-white bg-gray-600">
            Save
          </button>
        </div>
      </Form>

      {lastEntry && !entry && (
        <div className="pt-4 pb-8">
          <div className="p-4 my-4 text-sm text-gray-700 bg-gray-200">
            <div className="flex justify-between">
              <p className="font-medium">Last {exercise.name}</p>
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
