import { format, parseISO } from "date-fns";
import { json, Link, NavLink, Outlet, useLoaderData } from "remix";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { useOptionalUser } from "~/utils";

export async function loader({ request }) {
  let userId = await requireUserId(request);
  // let entries = await prisma.entry.findMany({
  //   where: { userId },
  //   include: {
  //     exercise: true,
  //     sets: true,
  //   },
  // });
  let exercises = await prisma.exercise.findMany();

  return json({ exercises });
}

export default function ExercisesLayout() {
  let user = useOptionalUser();
  let { exercises } = useLoaderData();

  return (
    <div>
      {user ? (
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Exercises</h1>
            <Link
              className="px-2 py-1 text-sm border-2 rounded"
              to="/entries/new"
            >
              + New entry
            </Link>
          </div>

          <div className="flex pb-4 mt-4 space-x-4 overflow-x-scroll">
            {exercises.map((exercise) => (
              <NavLink
                className={({ isActive }) =>
                  `${
                    isActive
                      ? "border-gray-800 bg-gray-800 text-white"
                      : "border-gray-300"
                  } whitespace-nowrap border  px-3 py-2`
                }
                to={`/exercises/${exercise.id}`}
                key={exercise.id}
              >
                {exercise.name}
              </NavLink>
            ))}
          </div>

          <Outlet />
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
