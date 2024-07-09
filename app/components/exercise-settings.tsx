import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { kilosToPounds, poundsToKilos } from "~/utils/unit-fns";

let ExerciseSettingsContext = createContext<undefined | { units: string }>(
  undefined
);

export function usePreferredUnit() {
  let context = useContext(ExerciseSettingsContext);

  if (context === undefined) {
    throw new Error(
      "usePreferredUnit must be used within an ExerciseSettings Provider"
    );
  }

  let units = context.units;
  let suffix = units === "kilos" ? "kg" : "lbs";

  function convertTo(value: number) {
    return units === "kilos" ? poundsToKilos(value) : value;
  }

  function convertFrom(value: number) {
    return units === "kilos" ? kilosToPounds(value) : value;
  }

  return { units, convertTo, convertFrom, suffix };
}

export function ExerciseSettingsProvider({
  units,
  children,
}: {
  units: string;
  children: ReactNode;
}) {
  return (
    <ExerciseSettingsContext.Provider value={{ units }}>
      {children}
    </ExerciseSettingsContext.Provider>
  );
}
