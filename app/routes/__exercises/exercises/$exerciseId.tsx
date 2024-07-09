import { Outlet, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { json } from "@remix-run/node";
import { createContext, useContext } from "react";
import poundsToKilos from "~/utils/pounds-to-kilos";

export async function loader({ request, params }) {
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

let ExerciseSettingsContext = createContext();

export function usePreferredUnit() {
  let { units } = useContext(ExerciseSettingsContext);

  let suffix = units === "kilos" ? "kg" : "lbs";

  function convertTo(value: number) {
    return units === "kilos" ? poundsToKilos(value) : value;
  }

  return { convertTo, suffix };
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
