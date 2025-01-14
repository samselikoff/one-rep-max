import { Link, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import EntryForm from "~/components/EntryForm";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { minDelay } from "~/utils/minDelay";
import Header from "~/components/header";
import { ChevronLeftIcon } from "@radix-ui/react-icons";

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
    <>
      <header className="bg-gray-900 pt-safe-top">
        <div className="flex items-start justify-between px-2 pt-4 pb-8">
          <Link
            className="inline-flex items-center text-xs font-medium text-blue-500"
            to={`/exercises/${exercise.id}`}
          >
            <ChevronLeftIcon width="20" height="20" />
            Summary
          </Link>

          <div className="flex h-5 items-center">
            <p className="text-xs font-medium text-blue-500">Today</p>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 text-center leading-none">
            <h1 className="text-sm font-semibold text-white">
              {exercise.name}
            </h1>
            <span className="text-xs font-medium leading-none text-gray-400">
              Log
            </span>
          </div>
        </div>
      </header>

      <main className="pb-safe-bottom">
        <div className="mt-5 px-4 pb-8">
          <EntryForm
            exercise={exercise}
            lastEntry={lastEntry}
            lastTrackedEntry={lastTrackedEntry}
          />
        </div>
      </main>
    </>
  );
}
