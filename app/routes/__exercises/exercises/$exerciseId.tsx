import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { ExerciseSettingsProvider } from "~/components/exercise-settings";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

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

export default function ExerciseIdLayout() {
  let { exerciseSettings } = useLoaderData();
  let settings = exerciseSettings;

  return (
    <ExerciseSettingsProvider units={settings?.unit || "pounds"}>
      <Outlet />
    </ExerciseSettingsProvider>
  );
}
