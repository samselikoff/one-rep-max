import { parseWithZod } from "@conform-to/zod";
import { ChevronLeftIcon, TrashIcon } from "@radix-ui/react-icons";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react";
import { format, isSameDay, parse, startOfToday } from "date-fns";
import { useState } from "react";
import { z } from "zod";
import { EntryForm } from "~/components/entry-form";
import Spinner from "~/components/Spinner";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { minDelay } from "~/utils/minDelay";

export async function loader({ request, params }: LoaderArgs) {
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

  if (!exercise || !entry) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

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

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request);
  let exerciseId = params.exerciseId;
  let formData = await request.formData();

  if (formData.get("_method") === "delete") {
    await prisma.entry.delete({
      where: { id: params.entryId },
    });

    return redirect(`/exercises/${exerciseId}`);
  } else {
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

    await prisma.set.deleteMany({
      where: { entryId: params.entryId },
    });

    await minDelay(
      prisma.entry.update({
        where: { id: params.entryId },
        data: submission.value,
      }),
      750
    );

    return redirect(`/exercises/${exerciseId}`);
  }
}

export default function EditEntryPage() {
  let { entry, lastEntry, exercise, lastTrackedEntry } =
    useLoaderData<typeof loader>();
  let { state } = useTransition();
  let isSaving = state === "submitting" || state === "loading";

  const [dateString, setDateString] = useState(entry.date.substring(0, 10));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-10 bg-gray-900 pt-safe-top">
        <div className="flex items-start justify-between px-2 pb-8 pt-4">
          <Link
            className="inline-flex items-center text-sm font-medium text-blue-500"
            to={`/exercises/${exercise.id}`}
          >
            <ChevronLeftIcon width="20" height="20" />
            Back
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
              {/* {isSaving ? "Saving..." : "Save"} */}
            </button>
          </div>
        </div>
      </header>

      <main className="relative mt-[calc(68px+env(safe-area-inset-top))] pb-safe-bottom">
        <div className="mt-5 px-4 pb-8">
          <EntryForm
            entry={entry}
            dateString={dateString}
            exercise={exercise}
            lastEntry={lastEntry}
            lastTrackedEntry={lastTrackedEntry}
          />

          <div className="mt-12">
            <Form method="post">
              <input type="hidden" name="_method" value="delete" />
              <button className="inline-flex items-center gap-2 rounded bg-gray-100 px-3 py-1.5 text-sm text-gray-500">
                <TrashIcon width="18" height="18" />
                Delete entry
              </button>
            </Form>
          </div>
        </div>
      </main>
    </>
  );
}
