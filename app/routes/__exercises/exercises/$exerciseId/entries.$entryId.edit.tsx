// @ts-nocheck
import { json, redirect, useLoaderData } from "remix";
import EntryForm from "~/components/EntryForm";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

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

  let lastEntry = await prisma.entry.findFirst({
    where: { userId, exerciseId: params.exerciseId },
    orderBy: { date: "desc" },
    include: {
      sets: true,
    },
  });

  return json({ entry, lastEntry, exercise });
}

export async function action({ request, params }) {
  let userId = await requireUserId(request);

  await prisma.set.deleteMany({
    where: { entryId: params.entryId },
  });

  let formData = await request.formData();
  let exerciseId = params.exerciseId;
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
  weights.forEach((weight, i) => {
    data.sets.create.push({ weight: +weight, reps: +reps[i] });
  });

  await prisma.entry.update({ where: { id: params.entryId }, data });

  return redirect(`/exercises/${exerciseId}`);
}

export default function EditEntryPage() {
  let { entry, lastEntry, exercise } = useLoaderData();

  return (
    <div className="px-4 mt-4">
      <h1 className="text-2xl font-semibold">{exercise.name} – Edit entry</h1>

      <EntryForm entry={entry} exercise={exercise} lastEntry={lastEntry} />
    </div>
  );
}
