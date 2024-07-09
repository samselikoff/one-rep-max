import { Outlet, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { json } from "@remix-run/node";
import { createContext, useContext } from "react";
import { kilosToPounds, poundsToKilos } from "~/utils/unit-fns";

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { exerciseId: string };
}) {
  let userId = await requireUserId(request);

  let exerciseSettings = await prisma.exerciseSettings.findUnique({
    where: {
      userId_exerciseId: {
        exerciseId: params.exerciseId,
        userId,
      },
    },
  });

  return json({ exerciseSettings });
}

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

export default function ExerciseIdLayout() {
  let { exerciseSettings } = useLoaderData();
  let settings = exerciseSettings;

  return (
    <ExerciseSettingsContext.Provider
      value={{ units: settings?.unit || "pounds" }}
    >
      <Outlet />
    </ExerciseSettingsContext.Provider>
  );
}
