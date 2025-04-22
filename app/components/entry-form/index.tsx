import { Form } from "@remix-run/react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { usePreferredUnit } from "../exercise-settings";
import { SetControls } from "./set-controls";
import { SetRow } from "./set-row";

export function EntryForm({
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
            weight: "0",
            reps: 0,
            tracked: false,
            complete: false,
            kind: "warm-up",
          },
        ]
  );
  const [selectedSetId, setSelectedSetId] = useState<null | string>(null);
  const selectedSet = sets.find((s) => s.id === selectedSetId);

  return (
    <div className="mt-4">
      <Form id="entry-form" method="post" ref={formRef}>
        <input type="hidden" name="date" value={dateString} />

        <div className="mt-6">
          <div className="flex flex-col divide-y">
            <AnimatePresence initial={false}>
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
            </AnimatePresence>
          </div>

          <div className="relative">
            <input className="opacity-0" placeholder="aa" />
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
      </Form>

      <AnimatePresence>
        {selectedSet && (
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
            onRepsChange={(v) =>
              setSets((sets) =>
                sets.map((s) => ({
                  ...s,
                  reps: s.id === selectedSetId ? v : s.reps,
                }))
              )
            }
            onAdd={() => {
              const newId = uuid();
              setSets((prev) => {
                const index = prev.indexOf(selectedSet);
                const newSets = prev.slice();
                newSets.splice(index + 1, 0, {
                  id: newId,
                  entryId: selectedSet.entryId,
                  complete: false,
                  kind: selectedSet.kind ?? "warm-up",
                  weight: selectedSet.weight ?? null,
                  reps: selectedSet.reps ?? null,
                  tracked: false,
                });

                return newSets;
              });
              setSelectedSetId(newId);
            }}
            onRemove={() => {
              const currentSelectedIndex = sets.indexOf(selectedSet);
              const newSelectedIndex =
                currentSelectedIndex > 0 ? currentSelectedIndex - 1 : 0;

              setSets((prev) => prev.filter((s) => s.id !== selectedSet.id));
              setSelectedSetId(sets[newSelectedIndex].id);
            }}
            onKindChange={(v) => {
              setSets((sets) =>
                sets.map((s) => ({
                  ...s,
                  kind: s.id === selectedSetId ? v : s.kind,
                }))
              );
            }}
            onClose={() => setSelectedSetId(null)}
          />
        )}
      </AnimatePresence>

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

export type Set = {
  id: string;
  weight: string | null;
  reps: number | null;
  tracked: boolean;
  complete: boolean;
  kind: string;
  entryId?: string;
};
