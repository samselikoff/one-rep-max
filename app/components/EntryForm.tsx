import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import * as Dialog from "@radix-ui/react-dialog";
import { Form, useTransition } from "@remix-run/react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { usePreferredUnit } from "./exercise-settings";
import { WheelSlider } from "./wheel-slider";

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
  const [selectedSetId, setSelectedSetId] = useState<null | string>(
    "cm8wv5fq61072g7ovgr2bod98"
  );
  const selectedSet = sets.find((s) => s.id === selectedSetId);

  let { state } = useTransition();
  let isSaving = state === "submitting" || state === "loading";

  return (
    <div className="mt-4">
      <Form
        method="post"
        ref={formRef}
        onBlur={(event) => {
          const nextFocused = event.relatedTarget || document.activeElement;

          if (!event.currentTarget.contains(nextFocused)) {
            setSets((sets) => {
              const lastSet = sets.at(-1);

              if (
                sets.length > 1 &&
                lastSet &&
                lastSet.weight === null &&
                lastSet.reps === null
              ) {
                return sets.slice(0, -1);
              } else {
                return sets;
              }
            });
          }
        }}
      >
        <input type="hidden" name="date" value={dateString} />

        <div className="mt-6">
          <div className="flex flex-col divide-y">
            {sets.map((set, index) => (
              <SetRow
                set={set}
                key={set.id}
                setSets={setSets}
                sets={sets}
                index={index}
                onSelect={() =>
                  setSelectedSetId((c) => (c === set.id ? null : set.id))
                }
                isSelected={selectedSetId === set.id}
              />
            ))}
          </div>

          <div className="relative">
            <input className="opacity-0" placeholder="aa" />
          </div>

          {/* <div className="mt-7">
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
          </div> */}
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

      {selectedSet && (
        <>
          <SetControls
            sets={sets}
            selectedSet={selectedSet}
            onWeightChange={(v) =>
              setSets((sets) =>
                sets.map((s) => ({
                  ...s,
                  weight: s.id === selectedSetId ? `${v}` : s.weight,
                }))
              )
            }
            onPrevious={() => {
              setSelectedSetId((prev) => {
                if (!prev) return prev;
                const currentIndex = sets.map((s) => s.id).indexOf(prev);

                return sets[currentIndex - 1].id;
              });
            }}
            onNext={() => {
              setSelectedSetId((prev) => {
                if (!prev) return prev;
                const currentIndex = sets.map((s) => s.id).indexOf(prev);

                return sets[currentIndex + 1].id;
              });
            }}
          />
        </>
      )}

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
  onSelect,
  isSelected,
}: {
  set: Set;
  setSets: React.Dispatch<React.SetStateAction<Set[]>>;
  sets: Set[];
  index: number;
  onSelect: () => void;
  isSelected: boolean;
}) {
  let { convertTo, convertFrom, units } = usePreferredUnit();
  let label = "";
  if (set.kind === "warm-up") {
    label = "Warm-up";
  } else {
    label = `Working set`;
    if (set.kind === "failure") {
      label += " – Failure";
    }
  }

  const labelClasses: Record<string, string> = {
    "warm-up": "bg-amber-400/20 text-amber-700",
    "working-set": "bg-green-400/20 text-green-700",
    failure: "bg-red-400/20 text-red-700",
  };

  return (
    <button
      onClick={onSelect}
      type="button"
      className={`block py-4 text-left ${isSelected ? "bg-gray-100" : ""}`}
    >
      <input
        type="hidden"
        name={`sets.create[${index}]kind`}
        value={set.kind}
      />

      <div>
        <p className="text-xs font-medium leading-5 text-gray-400">
          Set {index + 1}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex items-end gap-1">
            <div className="relative flex overflow-hidden">
              <span className="invisible font-mono text-3xl font-semibold leading-[36px] tracking-tight">
                {convertTo(set.weight ? +set.weight : 0)}
              </span>
              <input
                value={set.weight ? convertTo(+set.weight) : ""}
                placeholder="_"
                className="absolute h-[36px] w-[calc(100%+2px)] bg-transparent font-mono text-3xl font-semibold tabular-nums tracking-tight focus:outline-none"
                inputMode="decimal"
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
            <div className="relative flex">
              <div className="invisible font-mono text-3xl font-semibold leading-[36px]">
                {set.reps || 0}
              </div>
              <input
                className="absolute h-[36px] w-[calc(100%+2px)] bg-transparent font-mono text-3xl font-semibold focus:outline-none"
                placeholder="_"
                value={set.reps ? set.reps : ""}
                inputMode="numeric"
                name={`sets.create[${index}]reps`}
                onChange={(e) => {
                  setSets((sets) => {
                    let newSets = [...sets];
                    let currentSet = newSets[index];
                    let newReps =
                      e.target.value === "" ? null : +e.target.value;
                    let isLastSet = index === sets.length - 1;
                    newSets[index] = {
                      ...currentSet,
                      reps: newReps,
                    };

                    if (newReps !== null && isLastSet) {
                      newSets[index + 1] = {
                        id: uuid(),
                        weight: null,
                        reps: null,
                        tracked: false,
                        complete: false,
                        kind: sets[sets.length - 1].kind,
                      };
                    }
                    return newSets;
                  });
                }}
              />
            </div>
            <span className="pb-1 text-sm font-medium text-gray-500">reps</span>
          </div>
        </div>

        <div
          // onClick={() => {
          //   setSets((sets) => {
          //     let newSets = [...sets];
          //     let currentSet = newSets[index];
          //     let kinds = ["warm-up", "working-set", "failure"];
          //     let currentKindIndex = kinds.indexOf(currentSet.kind);
          //     let newKindIndex = (currentKindIndex + 1) % kinds.length;

          //     newSets[index] = {
          //       ...currentSet,
          //       kind: kinds[newKindIndex],
          //     };
          //     return newSets;
          //   });
          // }}
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
            labelClasses[set.kind]
          }`}
        >
          {label}
        </div>

        {/* <div className="flex">
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
        </div> */}
      </div>
      <div className="mt-2 flex items-center gap-3">
        {/* <p className="text-xs font-medium leading-5 text-gray-400">
          Set {index + 1}
        </p> */}
        {/* <button
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
          className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-500 ring-1 ring-black/5"
        >
          {label}
        </button> */}
      </div>
    </button>
  );
}

function SetControls({
  sets,
  selectedSet,
  onWeightChange,
  onNext,
  onPrevious,
}: {
  sets: Set[];
  selectedSet: Set;
  onWeightChange: (v: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  return (
    <Dialog.Root open modal={false}>
      <Dialog.Portal>
        <div className="fixed inset-x-0 bottom-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,.1),0_-2px_4px_-2px_rgba(0,0,0,.1)]">
          <Dialog.Content
            aria-describedby={undefined}
            className="p-4 focus:outline-none"
          >
            <Dialog.Title className="hidden">Set</Dialog.Title>
            <div>
              <div className="mb-4 text-center font-mono text-2xl tabular-nums">
                {selectedSet.weight} lbs
              </div>

              <div className="mt-2">
                <WheelSlider
                  value={selectedSet.weight ? +selectedSet.weight : 0}
                  onChange={onWeightChange}
                />
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  onClick={onNext}
                  className="inline-flex size-10 items-center justify-center focus:outline-none"
                >
                  <ChevronLeftIcon className="size-5 text-blue-500" />
                </button>
                <button className="h-10 px-3">
                  Set{" "}
                  <span className="tabular-nums">
                    {sets.indexOf(selectedSet) + 1}
                  </span>
                </button>
                <button
                  onClick={onPrevious}
                  className="inline-flex size-10 items-center justify-center focus:outline-none"
                >
                  <ChevronRightIcon className="size-5 text-blue-500" />
                </button>
              </div>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
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
