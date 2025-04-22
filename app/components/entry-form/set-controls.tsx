import * as Dialog from "@radix-ui/react-dialog";
import type { Set } from ".";
import { WheelSlider } from "../wheel-slider";
import { SetLabel } from "./set-label";
import { motion } from "framer-motion";
import { TrashIcon } from "@heroicons/react/16/solid";
import { usePreferredUnit } from "../exercise-settings";

export function SetControls({
  sets,
  selectedSet,
  onWeightChange,
  onRepsChange,
  onKindChange,
  onAdd,
  onRemove,
  onClose,
}: {
  sets: Set[];
  selectedSet: Set;
  onWeightChange: (v: number) => void;
  onRepsChange: (v: number) => void;
  onKindChange: (v: string) => void;
  onAdd: () => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  let { convertTo, convertFrom, suffix } = usePreferredUnit();
  const kinds = ["warm-up", "working-set", "failure"];
  const currentKindIndex = kinds.indexOf(selectedSet.kind);
  const nextKind = kinds[(currentKindIndex + 1) % 3];

  return (
    <Dialog.Root open modal={false}>
      <Dialog.Portal>
        <Dialog.Content
          aria-describedby={undefined}
          asChild
          className="fixed inset-x-0 bottom-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,.1),0_-2px_4px_-2px_rgba(0,0,0,.1)] focus:outline-none"
        >
          <motion.div
            initial={{ transform: "translateY(100%)" }}
            animate={{
              transform: "translateY(0%)",
              transition: { ease: [0.36, 0.66, 0.04, 1], duration: 0.4 },
            }}
            exit={{
              transform: "translateY(100%)",
              transition: { ease: [0.36, 0.66, 0.04, 1], duration: 0.45 },
            }}
          >
            <div className="px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-2">
              <div className="flex">
                {sets.length > 1 && (
                  <button
                    onClick={onRemove}
                    className="absolute left-4 top-2 size-10 font-medium text-gray-400"
                  >
                    <TrashIcon className="size-5" />
                  </button>
                )}
                <div className="ml-auto">
                  <button
                    onClick={onClose}
                    className="size-10 font-medium text-blue-500"
                  >
                    Done
                  </button>
                </div>
              </div>

              <Dialog.Title className="hidden">Set</Dialog.Title>

              <div>
                <div className="mt-2">
                  <div className="mb-2 text-center font-mono text-2xl tabular-nums">
                    {convertTo(selectedSet.weight ? +selectedSet.weight : 0)}{" "}
                    {suffix}
                  </div>

                  <WheelSlider
                    key={selectedSet.id}
                    value={convertTo(
                      selectedSet.weight ? +selectedSet.weight : 0
                    )}
                    onChange={(v) => onWeightChange(convertFrom(v))}
                    min={0}
                    max={1000}
                    step={5}
                    tickStep={10}
                    itemWidth={25}
                  />
                </div>
                <div className="mt-2">
                  <div className="mb-2 text-center font-mono text-2xl tabular-nums">
                    {selectedSet.reps} reps
                  </div>
                  <WheelSlider
                    key={selectedSet.id}
                    value={selectedSet.reps ? selectedSet.reps : 0}
                    onChange={onRepsChange}
                    min={0}
                    max={50}
                  />
                </div>

                <div className="relative mt-2 flex h-10 items-center">
                  <div className="flex-1">
                    <button
                      onClick={() => onKindChange(nextKind)}
                      className="shrink-0"
                    >
                      <SetLabel set={selectedSet} large />
                    </button>
                  </div>

                  <div className="flex-1 text-right">
                    <button
                      onClick={onAdd}
                      className="font-medium text-blue-500 focus:outline-none"
                    >
                      Add Set
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
