import * as Dialog from "@radix-ui/react-dialog";
import type { Set } from ".";
import { WheelSlider } from "../wheel-slider";
import { SetLabel } from "./set-label";
import { motion } from "framer-motion";
import { TrashIcon } from "@heroicons/react/16/solid";

export function SetControls({
  sets,
  selectedSet,
  onWeightChange,
  onRepsChange,
  onKindChange,
  onNext,
  onPrevious,
  onAdd,
  onRemove,
  onClose,
}: {
  sets: Set[];
  selectedSet: Set;
  onWeightChange: (v: number) => void;
  onRepsChange: (v: number) => void;
  onKindChange: (v: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onAdd: () => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  // const currentIndex = sets.indexOf(selectedSet);
  // const prevDisabled = currentIndex === 0;
  // const nextDisabled = currentIndex === sets.length - 1;

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
            initial={{ height: 0 }}
            animate={{
              height: "auto",
              transition: { ease: [0.36, 0.66, 0.04, 1], duration: 0.3 },
            }}
            exit={{
              height: 0,
              transition: { ease: [0.4, 0, 0.6, 1], duration: 0.3 },
            }}
          >
            <div className="px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-2">
              {sets.length > 1 && (
                <button
                  onClick={onRemove}
                  className="absolute left-4 top-2 size-10 font-medium text-gray-400"
                >
                  <TrashIcon className="size-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="absolute right-4 top-2 size-10 font-medium text-blue-500"
              >
                Done
              </button>
              <Dialog.Title className="hidden">Set</Dialog.Title>
              <div>
                <div className="mt-2">
                  <div className="mb-4 text-center font-mono text-2xl tabular-nums">
                    {selectedSet.weight} lbs
                  </div>
                  <WheelSlider
                    value={selectedSet.weight ? +selectedSet.weight : 0}
                    onChange={onWeightChange}
                    min={0}
                    max={1000}
                    step={5}
                  />
                </div>
                <div className="mt-2">
                  <div className="mb-4 text-center font-mono text-2xl tabular-nums">
                    {selectedSet.reps} reps
                  </div>
                  <WheelSlider
                    value={selectedSet.reps ? selectedSet.reps : 0}
                    onChange={onRepsChange}
                    min={0}
                    max={20}
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
