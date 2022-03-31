import { format, formatDistanceToNow, parseISO, startOfToday } from "date-fns";
import { useState } from "react";
import { Form } from "remix";

export default function EntryForm({ exercise, entry = null, lastEntry }) {
  let [sets, setSets] = useState(
    entry?.sets.length > 0
      ? entry.sets
      : [{ weight: "", reps: "", tracked: false }]
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
                  <th className="whitespace-nowrap pr-2 pb-2 text-sm font-medium text-gray-700">
                    Tracking set
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="pt-1">
                {sets.map((set, index) => (
                  <tr key={index + 1}>
                    <td className="whitespace-nowrap text-sm font-medium text-gray-700">
                      {index + 1}
                    </td>
                    <td className="py-1 pr-2">
                      <div className="flex">
                        <input
                          type="text"
                          name="weight"
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
                        type="number"
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
                        type="radio"
                        name="trackingSet"
                        className="color-blue-500"
                        value={index}
                        checked={set.tracked}
                        onChange={(e) => {
                          setSets((sets) => {
                            let newSets = [
                              ...sets.map((set) => {
                                set.tracked = false;
                                return set;
                              }),
                            ];
                            let currentSet = newSets[index];
                            newSets[index] = {
                              ...currentSet,
                              tracked: true,
                            };

                            return newSets;
                          });
                        }}
                      />
                    </td>

                    <td
                      className={`${
                        sets.length === 1 ? "pointer-events-none opacity-0" : ""
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSets((sets) => sets.filter((s, i) => i !== index));
                        }}
                        className="bg-gray-100 px-3 py-2"
                        type="button"
                      >
                        –
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* <div className="flex">
              <div className="flex w-full space-x-3">
                <div className="w-1/6"></div>
                <p className="w-2/6 whitespace-nowrap text-xs text-gray-500">
                  Weight (lbs)
                </p>
                <p className="w-2/6 whitespace-nowrap text-xs text-gray-500">
                  Reps
                </p>
                <div className="w-1/6"></div>
              </div>
            </div>
            <ol className="list-inside list-decimal space-y-2">
              {sets.map((set, index) => (
                <li key={index + 1} className="flex items-center space-x-3">
                  <span className="w-1/6 whitespace-nowrap text-sm font-medium text-gray-700">
                    {index + 1}
                  </span>
                  <div className="w-2/6">
                    <div>
                      <div className="flex">
                        <input
                          type="text"
                          name="weight"
                          className="z-0 block w-full min-w-0 flex-1 border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                      </div>
                    </div>
                  </div>
                  <div className="w-2/6">
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
                    className={`w-1/6 ${
                      sets.length === 1 ? "pointer-events-none opacity-0" : ""
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSets((sets) => sets.filter((s, i) => i !== index));
                      }}
                      className="bg-gray-100 px-3 py-2"
                      type="button"
                    >
                      –
                    </button>
                  </div>
                </li>
              ))}
            </ol> */}
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
              className="h-11 w-full border-2 border-dashed border-gray-300 text-sm font-medium text-gray-700"
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
              className="w-full border-gray-300"
              name="notes"
              rows={4}
            ></textarea>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 px-5 py-2 font-medium text-white"
          >
            Save
          </button>
        </div>
      </Form>

      {lastEntry && !entry && (
        <div className="pt-4 pb-8">
          <div className="my-4 bg-gray-200 p-4 text-sm text-gray-700">
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
