import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import { Form, Link as RemixLink, useTransition } from "@remix-run/react";
import { format, formatDistanceToNow, parseISO, startOfToday } from "date-fns";
import { Fragment, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { usePreferredUnit } from "./exercise-settings";

export default function EntryForm({
  exercise,
  entry = null,
  lastEntry,
  lastTrackedEntry,
}) {
  let { convertTo, convertFrom, suffix, units } = usePreferredUnit();
  let formRef = useRef();
  let [sets, setSets] = useState(
    entry?.sets.length > 0
      ? entry.sets
      : [{ id: uuid(), weight: "", reps: "", tracked: false }]
  );
  let defaultDate = entry
    ? parseISO(entry.date.substring(0, 10))
    : startOfToday();

  let { state } = useTransition();
  let isSaving = state === "submitting" || state === "loading";

  return (
    <div className="mt-4">
      <Form method="post" ref={formRef}>
        <label>
          <div className="text-sm font-medium">Date</div>

          <input
            type="date"
            className="mt-2 w-full rounded border p-2"
            defaultValue={format(defaultDate, "yyyy-MM-dd")}
            name="date"
          />
        </label>

        <div className="mt-6">
          <div className="grid grid-cols-[40px_1fr_1fr_1fr_auto] items-center gap-2">
            <p className="text-sm font-medium">Set</p>
            <p className="text-sm font-medium capitalize">{units}</p>
            <div />
            <p className="text-center text-sm font-medium">Failure</p>
            <div />

            {sets.map((set, index) => (
              <Fragment key={set.id}>
                <p className="ml-1.5 tabular-nums text-gray-500">{index + 1}</p>
                <input
                  placeholder="Weight"
                  inputMode="decimal"
                  className="w-full rounded border px-2.5 py-1.5"
                  value={convertTo(set.weight)}
                  autoFocus={set === sets.at(-1)}
                  onChange={(e) => {
                    setSets((sets) => {
                      let newSets = [...sets];
                      let currentSet = newSets[index];
                      newSets[index] = {
                        ...currentSet,
                        weight: convertFrom(e.target.value),
                      };
                      return newSets;
                    });
                  }}
                />
                <input type="hidden" name="weight" value={set.weight} />
                <input
                  placeholder="Reps"
                  inputMode="numeric"
                  name="reps"
                  className="w-full rounded border px-2.5 py-1.5"
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
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    name="trackingSet"
                    value={index}
                    checked={set.tracked}
                    onChange={(e) => {
                      setSets((sets) =>
                        sets.map((set, i) => ({
                          ...set,
                          tracked: i === index ? !set.tracked : set.tracked,
                        }))
                      );
                    }}
                  />
                </div>

                <div className="items-center justify-end">
                  <button
                    onClick={() => {
                      setSets((sets) => sets.filter((s, i) => i !== index));
                    }}
                    disabled={sets.length === 1}
                    className="rounded bg-gray-100 p-2 disabled:opacity-50"
                    type="button"
                  >
                    <MinusIcon width="18" height="18" />
                  </button>
                </div>
              </Fragment>
            ))}
          </div>

          <div className="mt-7">
            <button
              className="inline-flex w-full items-center justify-center gap-3 rounded bg-gray-200 py-1.5 px-2.5"
              type="button"
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
              }}
            >
              <PlusIcon />
              Add set
            </button>
          </div>
        </div>

        <div className="mt-6">
          <label>
            <p className="text-sm font-medium">Notes</p>

            <textarea
              className="mt-2 w-full border p-3"
              placeholder="How'd that feel?"
              defaultValue={entry?.notes || ""}
              name="notes"
              rows={4}
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <RemixLink
            className="text-sm font-medium text-blue-500"
            to={`/exercises/${exercise.id}`}
          >
            Cancel
          </RemixLink>

          <button
            type="submit"
            className="rounded bg-blue-500 py-1.5 px-3 font-medium text-white disabled:opacity-50"
            disabled={isSaving}
          >
            Save
          </button>
        </div>
      </Form>

      {lastEntry && (
        <div className="mt-10 border p-2">
          <div className="flex justify-between">
            <p className="text-xs text-gray-500">Previous {exercise.name}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(parseISO(lastEntry.date.substring(0, 10)))}{" "}
              ago
            </p>
          </div>

          <div className="mt-4">
            {lastEntry.sets.map((set) => (
              <p className="text-gray-600" key={set.id}>
                {convertTo(set.weight)} {suffix} - {set.reps} reps
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
