import { format, parseISO } from "date-fns";
import { json, Link, useLoaderData } from "remix";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { useOptionalUser } from "~/utils";

export async function loader({ request }) {
  let userId = await requireUserId(request);
  let entries = await prisma.entry.findMany({
    where: { userId },
    include: {
      exercise: true,
    },
  });

  return json({ entries });
}

export default function Index() {
  let user = useOptionalUser();
  let { entries } = useLoaderData();

  return (
    <div>
      {user ? (
        <div className="px-4 mt-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Entries</h1>
            <Link
              className="px-2 py-1 text-sm border-2 rounded"
              to="/entries/new"
            >
              + New entry
            </Link>
          </div>

          <div className="mt-8 space-y-6">
            {entries.map((entry) => (
              <div key={entry.id}>
                <div className="flex items-center justify-between text-lg">
                  <p className="font-semibold">{entry.exercise.name}</p>
                  <p className="text-sm text-gray-600">
                    {format(parseISO(entry.date), "EEEE, MMMM do")}
                  </p>
                </div>
                <p className="mt-1 text-gray-700">{entry.notes}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center px-8 mt-40 space-x-4">
          <Link
            className="block w-1/2 py-2 font-medium text-center text-white bg-gray-600"
            to="/join"
          >
            Sign up
          </Link>
          <Link
            className="block w-1/2 py-2 font-medium text-center text-white bg-gray-600"
            to="/login"
          >
            Log In
          </Link>
        </div>
      )}
    </div>
  );
}
