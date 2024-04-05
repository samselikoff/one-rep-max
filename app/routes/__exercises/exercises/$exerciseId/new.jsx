import { useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import EntryForm from "~/components/EntryForm";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { Box, Heading } from "@radix-ui/themes";
import { minDelay } from "~/utils/minDelay";

export async function loader({ request, params }) {
  let userId = await requireUserId(request);

  let exercise = await prisma.exercise.findFirst({
    where: { id: params.exerciseId },
  });

  let entries = await prisma.entry.findMany({
    where: { userId, exerciseId: params.exerciseId },
    orderBy: { date: "desc" },
    include: {
      sets: true,
    },
  });

  let lastEntry = entries[0];
  let lastTrackedEntry = entries.find((entry) =>
    entry.sets.some((s) => s.tracked)
  );

  return json({ lastEntry, exercise, lastTrackedEntry });
}

export async function action({ request, params }) {
  let userId = await requireUserId(request);
  let formData = await request.formData();
  let exerciseId = params.exerciseId;
  let date = formData.get("date");
  let notes = formData.get("notes");
  let weights = formData.getAll("weight");
  let reps = formData.getAll("reps");
  let trackingSetIndexes = formData.getAll("trackingSet").map((i) => +i);
  let data = {
    userId,
    exerciseId,
    date: `${date}T00:00:00.000Z`,
    notes,
    sets: { create: [] },
  };
  weights.forEach((weight, index) => {
    data.sets.create.push({
      weight: +weight,
      reps: +reps[index],
      tracked: trackingSetIndexes.includes(index),
    });
  });

  await minDelay(prisma.entry.create({ data }), 750);

  return redirect(`/exercises/${exerciseId}`);
}

export default function NewEntryPage() {
  let { lastEntry, exercise, lastTrackedEntry } = useLoaderData();

  return (
    <Box px="4" mt="5" pb="7">
      <Heading>{exercise.name} – New</Heading>

      <EntryForm
        exercise={exercise}
        lastEntry={lastEntry}
        lastTrackedEntry={lastTrackedEntry}
      />
    </Box>
  );
}
