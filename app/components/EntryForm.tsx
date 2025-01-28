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
  let { convertTo, suffix } = usePreferredUnit();
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
  const [isShowingNotes, setIsShowingNotes] = useState(false);

  return (
    <div className="mt-4">
      <Form method="post" ref={formRef}>
        <input type="hidden" name="date" value={dateString} />

        <div className="mt-6">
          <div className="flex flex-col gap-6">
            {sets.map((set, index) => (
              <SetRow
                set={set}
                key={set.id}
                setSets={setSets}
                sets={sets}
                index={index}
              />
            ))}
          </div>

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
          {!isShowingNotes ? (
            <>
              <button
                className="text-xs text-gray-400 underline underline-offset-2"
                onClick={() => setIsShowingNotes(true)}
                type="button"
              >
                Show notes
              </button>
              <input type="hidden" name="notes" value={entry?.notes || ""} />
            </>
          ) : (
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
          )}
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            type="submit"
            className="rounded bg-blue-500 px-3 py-1.5 font-medium text-white disabled:opacity-50"
            disabled={
              isSaving ||
              sets[0].weight === null ||
              sets[0].reps === null ||
              sets[0].weight === ""
            }
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

function SetRow({
  set,
  setSets,
  sets,
  index,
}: {
  set: Set;
  setSets: React.Dispatch<React.SetStateAction<Set[]>>;
  sets: Set[];
  index: number;
}) {
  let { convertTo, convertFrom, units } = usePreferredUnit();
  let label = "";
  if (set.kind === "warm-up") {
    label = "Warm-up";
  } else {
    let workingSetNumber =
      sets
        .filter((s) => s.kind === "working-set" || s.kind === "failure")
        .findIndex((s) => s.id === set.id) + 1;
    label = `Working Set ${workingSetNumber}`;
    if (set.kind === "failure") {
      label += " – Failure";
    }
  }

  return (
    <div className="relative flex items-center justify-between rounded-lg bg-gray-100 px-3 py-4">
      <button
        type="button"
        onClick={() => {
          setSets((sets) => {
            let newSets = [...sets];
            let currentSet = newSets[index];
            let kinds = ["warm-up", "working-set", "failure"];
            let currentKindIndex = kinds.indexOf(currentSet.kind);
            let newKindIndex = (currentKindIndex + 1) % kinds.length;

            newSets[index] = {
              ...currentSet,
              kind: kinds[newKindIndex],
            };
            return newSets;
          });
        }}
        className="absolute -top-2.5 left-2 rounded-full bg-white px-2 py-0.5 text-xs text-gray-500 ring-1 ring-black/5"
      >
        {label}
      </button>
      <input
        type="hidden"
        name={`sets.create[${index}]kind`}
        value={set.kind}
      />
      <div className="flex gap-4">
        <div className="flex items-end gap-1">
          <div className="relative">
            <span className="invisible text-3xl font-semibold tracking-tight">
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
                    weight:
                      e.target.value === ""
                        ? null
                        : `${convertFrom(+e.target.value)}`,
                  };
                  return newSets;
                });
              }}
            />
            <input
              type="hidden"
              name={`sets.create[${index}]weight`}
              value={set.weight || ""}
            />
          </div>
          <span className="pb-1 text-sm font-medium text-gray-500">
            {units === "pounds" ? "lbs" : "kilos"}
          </span>
        </div>

        <div className="flex items-end gap-1">
          <div className="relative">
            <span className="invisible text-3xl font-semibold tracking-tight">
              {set.reps || 0}
            </span>
            <input
              className="absolute inset-0 bg-transparent text-3xl font-semibold tracking-tight"
              placeholder="_"
              value={set.reps ? set.reps : ""}
              inputMode="numeric"
              name={`sets.create[${index}]reps`}
              onChange={(e) => {
                setSets((sets) => {
                  let newSets = [...sets];
                  let currentSet = newSets[index];
                  newSets[index] = {
                    ...currentSet,
                    reps: e.target.value === "" ? null : +e.target.value,
                  };
                  return newSets;
                });
              }}
            />
          </div>
          <span className="pb-1 text-sm font-medium text-gray-500">reps</span>
        </div>
      </div>
      <div className="flex">
        <Checkbox.Root
          name={`sets.create[${index}]complete`}
          checked={set.complete}
          onCheckedChange={() => {
            setSets((sets) => {
              let newSets = [...sets];
              let currentSet = newSets[index];

              newSets[index] = {
                ...currentSet,
                complete: !set.complete,
              };
              return newSets;
            });
          }}
          className="inline-flex size-8 items-center justify-center rounded-full border-2 bg-white"
        >
          <Checkbox.Indicator className="inline-flex size-6 items-center justify-center rounded-full bg-blue-500">
            <CheckIcon className="size-4 text-white" />
          </Checkbox.Indicator>
        </Checkbox.Root>
      </div>
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
