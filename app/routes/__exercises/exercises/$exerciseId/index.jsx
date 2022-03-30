import { format, parseISO } from "date-fns";
import { json, Link, useLoaderData, useParams } from "remix";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

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
        <Link className="border px-2 py-1" to={`/exercises/${exercise.id}/new`}>
          + New
        </Link>
      </div>

      <div className="mt-2">
        {entries.length > 0 ? (
          <div className="divide-y">
            {entries.map((entry) => (
              <div key={entry.id} className="py-4">
                <div className="flex justify-between">
                  <p className="font-medium ">
                    {format(parseISO(entry.date.substring(0, 10)), "MMMM do")}
                  </p>
                  <Link
                    to={`/exercises/${exerciseId}/entries/${entry.id}/edit`}
                    className="text-right text-sm text-sky-500"
                  >
                    Edit
                  </Link>
                </div>
                <div className="mt-2">
                  {entry.sets.map((set) => (
                    <div key={set.id}>
                      <p>
                        {set.weight} lbs – {set.reps} reps
                        {set.tracked && " 👈"}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm italic text-gray-700">
                  {entry.notes}
                </p>
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
