import { format, formatDistanceToNow, parseISO } from "date-fns";
import { json, Link, useLoaderData, useParams } from "remix";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { PencilAltIcon } from "@heroicons/react/outline";

export async function loader({ request, params }) {
  let userId = await requireUserId(request);

  let entries = await prisma.entry.findMany({
    where: { userId, exerciseId: params.exerciseId },
    include: {
      exercise: true,
      sets: true,
    },
    orderBy: { date: "desc" },
  });

  let exercise = await prisma.exercise.findFirst({
    where: { id: params.exerciseId },
  });

  return json({ exercise, entries });
}
export default function ExerciseIndexPage() {
  let { exercise, entries } = useLoaderData();
  let { exerciseId } = useParams();

  return (
    <div className="mt-4 px-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">{exercise.name}</h1>
        <Link
          className="flex items-center whitespace-nowrap p-1 text-sm font-medium text-blue-500"
          to={`/exercises/${exercise.id}/new`}
        >
          <PencilAltIcon className="h-5 w-5" />
        </Link>
      </div>

      <div className="mt-2">
        {entries.length > 0 ? (
          <div className="divide-y">
            {entries.map((entry) => (
              <div key={entry.id} className="py-4">
                <div className="flex justify-between">
                  <p className="text-[15px]">
                    <span className="font-semibold">
                      {format(parseISO(entry.date.substring(0, 10)), "MMMM do")}
                    </span>
                    <span className="px-1 font-medium text-gray-500">
                      &middot;
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(
                        parseISO(entry.date.substring(0, 10)),
                        "MMMM do"
                      )}{" "}
                      ago
                    </span>
                  </p>
                </div>
                <div className="mt-1">
                  {entry.sets.map((set) => (
                    <div key={set.id}>
                      <p>
                        {set.weight} lbs – {set.reps} reps
                        {set.tracked && " 👈"}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-sm italic text-gray-700">
                  {entry.notes}
                </p>
                <div className="mt-4 text-right">
                  <Link
                    to={`/exercises/${exerciseId}/entries/${entry.id}/edit`}
                    className="text-right text-sm text-gray-500 underline"
                  >
                    Edit this entry
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6">No entries.</p>
        )}
      </div>
    </div>
  );
}
