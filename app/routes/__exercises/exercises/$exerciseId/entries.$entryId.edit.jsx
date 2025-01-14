import { Form, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import EntryForm from "~/components/EntryForm";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { minDelay } from "~/utils/minDelay";
import { Box, Button, Heading } from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";

export async function loader({ request, params }) {
  let userId = await requireUserId(request);

  let exercise = await prisma.exercise.findFirst({
    where: { id: params.exerciseId },
  });

  let entry = await prisma.entry.findFirst({
    where: { id: params.entryId },
    include: {
      sets: true,
    },
  });

  let entries = await prisma.entry.findMany({
    where: { userId, exerciseId: params.exerciseId, date: { lt: entry.date } },
    orderBy: { date: "desc" },
    include: {
      sets: true,
    },
  });

  let lastEntry = entries[0];
  let lastTrackedEntry = entries.find((entry) =>
    entry.sets.some((s) => s.tracked)
  );

  return json({ entry, lastEntry, exercise, lastTrackedEntry });
}

export async function action({ request, params }) {
  let userId = await requireUserId(request);
  let exerciseId = params.exerciseId;
  let formData = await request.formData();

  if (formData.get("_method") === "delete") {
    await prisma.entry.delete({
      where: { id: params.entryId },
    });

    return redirect(`/exercises/${exerciseId}`);
  } else {
    await prisma.set.deleteMany({
      where: { entryId: params.entryId },
    });
    let date = formData.get("date");
    let notes = formData.get("notes");
    let weights = formData.getAll("weight");
    let reps = formData.getAll("reps");
    let data = {
      userId,
      exerciseId,
      date: `${date}T00:00:00.000Z`,
      notes,
      sets: { create: [] },
    };

    let trackingSetIndexes = formData.getAll("trackingSet").map((i) => +i);
    weights.forEach((weight, index) => {
      data.sets.create.push({
        weight: +weight,
        reps: +reps[index],
        tracked: trackingSetIndexes.includes(index),
      });
    });

    await minDelay(
      prisma.entry.update({ where: { id: params.entryId }, data }),
      750
    );

    return redirect(`/exercises/${exerciseId}`);
  }
}

export default function EditEntryPage() {
  let { entry, lastEntry, exercise, lastTrackedEntry } = useLoaderData();

  return (
    <Box px="4" mt="5" pb="7">
      <h1 className="text-2xl font-bold">{exercise.name} – Edit</h1>

      <EntryForm
        entry={entry}
        exercise={exercise}
        lastEntry={lastEntry}
        lastTrackedEntry={lastTrackedEntry}
      />

      <Box mt="6">
        <Form method="post">
          <input type="hidden" name="_method" value="delete" />
          <Button variant="soft" color="gray">
            <TrashIcon width="18" height="18" />
            Delete entry
          </Button>
        </Form>
      </Box>
    </Box>
  );
}
