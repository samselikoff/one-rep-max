import * as Dialog from "@radix-ui/react-dialog";
import type { Set } from ".";
import { WheelSlider } from "../wheel-slider";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { SetLabel } from "./set-label";

export function SetControls({
  sets,
  selectedSet,
  onWeightChange,
  onRepsChange,
  onKindChange,
  onNext,
  onPrevious,
  onAdd,
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
  onClose: () => void;
}) {
  const currentIndex = sets.indexOf(selectedSet);
  const prevDisabled = currentIndex === 0;
  const nextDisabled = currentIndex === sets.length - 1;

  const kinds = ["warm-up", "working-set", "failure"];
  const currentKindIndex = kinds.indexOf(selectedSet.kind);
  const nextKind = kinds[(currentKindIndex + 1) % 3];

  return (
    <Dialog.Root open modal={false}>
      <Dialog.Portal>
        <div>
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-x-0 bottom-0 bg-white p-4 pb-safe-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,.1),0_-2px_4px_-2px_rgba(0,0,0,.1)] focus:outline-none"
          >
            <button
              onClick={onClose}
              className="absolute right-0 top-0 size-10 text-gray-400"
            >
              <XMarkIcon className="size-5" />
            </button>
            <Dialog.Title className="hidden">Set</Dialog.Title>
            <div className="">
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

                <div className="flex items-center">
                  <button
                    onClick={onPrevious}
                    disabled={prevDisabled}
                    className="inline-flex size-10 items-center justify-center focus:outline-none disabled:opacity-50 disabled:grayscale"
                  >
                    <ChevronLeftIcon className="size-6 text-blue-500" />
                  </button>
                  <span className="px-1">
                    Set{" "}
                    <span className="tabular-nums">
                      {sets.indexOf(selectedSet) + 1}
                    </span>
                  </span>
                  <button
                    onClick={onNext}
                    disabled={nextDisabled}
                    className="inline-flex size-10 items-center justify-center focus:outline-none disabled:opacity-50 disabled:grayscale"
                  >
                    <ChevronRightIcon className="size-6 text-blue-500" />
                  </button>
                </div>

                <div className="flex-1 text-right">
                  <button
                    onClick={onAdd}
                    className="font-medium text-blue-500 focus:outline-none"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
