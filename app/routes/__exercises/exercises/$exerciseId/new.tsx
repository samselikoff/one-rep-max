import { Link, useLoaderData, useTransition } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { minDelay } from "~/utils/minDelay";
import { EntryForm } from "~/components/entry-form";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { format, startOfToday } from "date-fns";
import Spinner from "~/components/Spinner";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";

export async function loader({ request, params }: LoaderArgs) {
  let userId = await requireUserId(request);

  let exercise = await prisma.exercise.findFirst({
    where: { id: params.exerciseId },
  });

  if (!exercise) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

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

export async function action({ request, params }: ActionArgs) {
  let userId = await requireUserId(request);
  let formData = await request.formData();

  const exerciseId = z.string().parse(params.exerciseId);
  const submission = parseWithZod(formData, {
    schema: z.object({
      date: z.date(),
      notes: z.string().optional(),
      sets: z.object({
        create: z.array(
          z.object({
            kind: z.string(),
            weight: z.number(),
            reps: z.number(),
            complete: z.coerce.boolean(),
          })
        ),
      }),
    }),
  });

  if (submission.status !== "success") {
    console.error(submission.error);
    throw new Error("invalid");
  }

  await minDelay(
    prisma.entry.create({ data: { exerciseId, userId, ...submission.value } }),
    250
  );

  return redirect(`/exercises/${exerciseId}`);
}

export default function NewEntryPage() {
  let { lastEntry, exercise, lastTrackedEntry } =
    useLoaderData<typeof loader>();

  const [dateString, setDateString] = useState(
    format(startOfToday(), "yyyy-MM-dd")
  );

  let { state } = useTransition();
  let isSaving = state === "submitting" || state === "loading";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-10 bg-gray-900 pt-safe-top">
        <div className="flex items-start justify-between px-2 pb-8 pt-4">
          <Link
            className="inline-flex items-center text-sm font-medium text-blue-500"
            to={`/exercises/${exercise.id}`}
          >
            <ChevronLeftIcon width="20" height="20" />
            Cancel
          </Link>

          <div className="absolute left-1/2 -translate-x-1/2 text-center leading-none">
            <h1 className="mb-0.5 font-medium leading-5 text-white">
              {exercise.name}
            </h1>

            <input
              type="date"
              value={dateString}
              className="bg-transparent text-sm font-medium text-blue-500"
              style={{ colorScheme: "dark" }}
              onChange={(e) => setDateString(e.target.value)}
            />
          </div>

          <div>
            <button
              className="text-sm font-medium text-blue-500"
              type="submit"
              form="entry-form"
            >
              <Spinner loading={isSaving}>Save</Spinner>
            </button>
          </div>
        </div>
      </header>

      <main className="relative mt-[calc(68px+env(safe-area-inset-top))] pb-safe-bottom">
        <div className="mt-5 px-4 pb-8">
          <EntryForm
            dateString={dateString}
            exercise={exercise}
            lastEntry={lastEntry}
            lastTrackedEntry={lastTrackedEntry}
          />
        </div>
      </main>
    </>
  );
}
