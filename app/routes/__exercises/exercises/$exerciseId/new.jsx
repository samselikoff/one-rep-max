import { json, redirect, useLoaderData } from "remix";
import EntryForm from "~/components/EntryForm";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }) {
  let userId = await requireUserId(request);

  let exercise = await prisma.exercise.findFirst({
    where: { id: params.exerciseId },
  });

  let lastEntry = await prisma.entry.findFirst({
    where: { userId, exerciseId: params.exerciseId },
    orderBy: { date: "desc" },
    include: {
      sets: true,
    },
  });

  return json({ lastEntry, exercise });
}

export async function action({ request, params }) {
  let userId = await requireUserId(request);
  let formData = await request.formData();
  let exerciseId = params.exerciseId;
  let date = formData.get("date");
  let notes = formData.get("notes");
  let weights = formData.getAll("weight");
  let reps = formData.getAll("reps");
  let trackingSet = +formData.getAll("trackingSet");
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
      tracked: index === trackingSet,
    });
  });

  await prisma.entry.create({ data });

  return redirect(`/exercises/${exerciseId}`);
}

export default function NewEntryPage() {
  let { lastEntry, exercise } = useLoaderData();

  return (
    <div className="mt-4 px-4">
      <h1 className="text-2xl font-semibold">{exercise.name} – New entry</h1>

      <EntryForm exercise={exercise} lastEntry={lastEntry} />
    </div>
  );
}
