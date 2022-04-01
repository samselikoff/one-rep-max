import { Form, json, redirect, useLoaderData } from "remix";
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

    let trackingSet = +formData.getAll("trackingSet");
    weights.forEach((weight, index) => {
      data.sets.create.push({
        weight: +weight,
        reps: +reps[index],
        tracked: index === trackingSet,
      });
    });

    await prisma.entry.update({ where: { id: params.entryId }, data });

    return redirect(`/exercises/${exerciseId}`);
  }
}

export default function EditEntryPage() {
  let { entry, lastEntry, exercise } = useLoaderData();

  return (
    <div className="mt-6 px-4">
      <h1 className="text-3xl font-bold">{exercise.name} – Edit</h1>

      <EntryForm entry={entry} exercise={exercise} lastEntry={lastEntry} />

      <Form className="pb-16" method="post">
        <input type="hidden" name="_method" value="delete" />
        <button className="text-sm text-gray-500 underline" type="submit">
          Delete this entry...
        </button>
      </Form>
    </div>
  );
}
