import clsx from "clsx";
import type { Set } from ".";

export function SetLabel({
  set,
  large = false,
}: {
  set: Set;
  large?: boolean;
}) {
  let label = "";
  if (set.kind === "warm-up") {
    label = "Warm-up";
  } else if (set.kind === "working-set") {
    label = `Working set`;
  } else {
    label = "Failure set";
  }

  const labelClasses: Record<string, string> = {
    "warm-up": "bg-amber-400/20 text-amber-700",
    "working-set": "bg-green-400/20 text-green-700",
    failure: "bg-red-400/20 text-red-700",
  };

  return (
    <span
      className={clsx(
        `whitespace-nowrap rounded-md`,
        labelClasses[set.kind],
        large
          ? "px-2 py-1 text-sm font-medium"
          : "px-2 py-0.5 text-xs font-medium"
      )}
    >
      {label}
    </span>
  );
}
