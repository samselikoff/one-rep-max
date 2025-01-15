import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Form, Link, useTransition } from "@remix-run/react";
import { format, formatDistanceToNow, parseISO, startOfToday } from "date-fns";
import { Fragment, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { CheckIcon } from "@heroicons/react/16/solid";
import { usePreferredUnit } from "./exercise-settings";

export default function EntryForm({
  exercise,
  dateString,
  entry = null,
  lastEntry,
  lastTrackedEntry,
}: {
  exercise: { id: string; name: string };
  dateString: string;
  entry?: Entry | null;
  lastEntry: Entry | null;
  lastTrackedEntry?: Entry | null;
}) {
  let { convertTo, convertFrom, suffix, units } = usePreferredUnit();
  let formRef = useRef(null);
  let [sets, setSets] = useState(
    entry && entry.sets.length > 0
      ? entry.sets
      : [
          {
            id: uuid(),
            weight: null,
            reps: null,
            tracked: false,
            complete: false,
            kind: "warm-up",
          },
        ]
  );

  let { state } = useTransition();
  let isSaving = state === "submitting" || state === "loading";

  return (
    <div className="mt-4">
      <Form method="post" ref={formRef}>
        <input type="hidden" name="date" value={dateString} />

        <div className="mt-6">
          <div className="flex flex-col gap-6">
            {sets.map((set, index) => (
              <div
                key={set.id}
                className="relative flex justify-between rounded-lg bg-gray-100 px-3 py-4"
              >
                <button className="absolute -top-2.5 left-2 rounded-full bg-white px-2 py-0.5 text-xs text-gray-500 ring-1 ring-black/5">
                  Warm-up
                </button>
                <div className="flex gap-4">
                  <div className="flex items-end">
                    <div className="relative">
                      <span className="invisible text-3xl font-semibold tabular-nums tracking-tight">
                        {convertTo(set.weight ? +set.weight : 0)}
                      </span>
                      <input
                        value={set.weight ? convertTo(+set.weight) : ""}
                        placeholder="_"
                        className="absolute inset-0 bg-transparent text-3xl font-semibold tracking-tight"
                        inputMode="decimal"
                        // autoFocus={set === sets.at(-1)}
                        onChange={(e) => {
                          setSets((sets) => {
                            let newSets = [...sets];
                            let currentSet = newSets[index];
                            newSets[index] = {
                              ...currentSet,
                              weight: `${convertFrom(+e.target.value)}`,
                            };
                            return newSets;
                          });
                        }}
                      />
                      <input
                        type="hidden"
                        name="weight"
                        value={set.weight || ""}
                      />
                    </div>
                    <span className="pb-1 text-sm font-medium text-gray-500">
                      {units === "pounds" ? "lbs" : "kilos"}
                    </span>
                  </div>
                  <div className="flex items-end">
                    <div className="relative">
                      <span className="invisible text-3xl font-semibold tabular-nums tracking-tight">
                        {set.reps || 0}
                      </span>
                      <input
                        className="absolute inset-0 bg-transparent text-3xl font-semibold tracking-tight"
                        placeholder="_"
                        value={set.reps ? set.reps : ""}
                        inputMode="numeric"
                        name="reps"
                        onChange={(e) => {
                          setSets((sets) => {
                            let newSets = [...sets];
                            let currentSet = newSets[index];
                            newSets[index] = {
                              ...currentSet,
                              reps: +e.target.value,
                            };
                            return newSets;
                          });
                        }}
                      />
                    </div>
                    <span className="pb-1 text-sm font-medium text-gray-500">
                      reps
                    </span>
                  </div>
                </div>
                <div>
                  <Checkbox.Root
                    name="complete"
                    className="inline-flex size-8 items-center justify-center rounded-full border-2 bg-white"
                  >
                    <Checkbox.Indicator className="inline-flex size-6 items-center justify-center rounded-full bg-blue-500">
                      <CheckIcon className="size-4 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                </div>
              </div>
            ))}
          </div>

          {/* <div className="grid grid-cols-[40px_1fr_1fr_1fr_auto] items-center gap-2">
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
          </div> */}

          <div className="mt-7">
            <button
              className="inline-flex w-full items-center justify-center gap-3 rounded bg-gray-200 px-2.5 py-1.5"
              type="button"
              onClick={() => {
                setSets((sets) => [
                  ...sets,
                  {
                    id: uuid(),
                    weight: sets[sets.length - 1].weight,
                    reps: sets[sets.length - 1].reps,
                    tracked: false,
                    complete: false,
                    kind: sets[sets.length - 1].kind,
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
          <Link
            className="text-sm font-medium text-blue-500"
            to={`/exercises/${exercise.id}`}
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="rounded bg-blue-500 px-3 py-1.5 font-medium text-white disabled:opacity-50"
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
                {convertTo(set.weight ? +set.weight : 0)} {suffix} - {set.reps}{" "}
                reps
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type Entry = {
  id: string;
  date: string;
  notes: string | null;
  userId: string;
  exerciseId: string;
  sets: Set[];
};

type Set = {
  id: string;
  weight: string | null;
  reps: number | null;
  tracked: boolean;
  complete: boolean;
  kind: string;
  entryId?: string;
};
