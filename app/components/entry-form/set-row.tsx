import { v4 as uuid } from "uuid";
import type { Set } from ".";
import { usePreferredUnit } from "../exercise-settings";
import { SetLabel } from "./set-label";

export function SetRow({
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

  return (
    <div className="relative">
      <div className="absolute inset-0 w-full bg-green-500" />
      <div className="relative flex flex-col bg-white">
        <button
          onClick={onSelect}
          type="button"
          className={`-mx-4 block px-4 py-4 text-left ${
            isSelected ? "bg-gray-100" : ""
          }`}
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
                    {set.reps}
                  </div>
                  <input
                    className="absolute h-[36px] w-[calc(100%+2px)] bg-transparent font-mono text-3xl font-semibold focus:outline-none"
                    placeholder="_"
                    value={set.reps ?? 0}
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
                <span className="pb-1 text-sm font-medium text-gray-500">
                  reps
                </span>
              </div>
            </div>
            <SetLabel set={set} />
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
      </div>
    </div>
  );
}
