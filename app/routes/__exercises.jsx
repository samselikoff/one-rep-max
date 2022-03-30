import { json, Link, NavLink, Outlet, useLoaderData } from "remix";
import { prisma } from "~/db.server";
import { useOptionalUser } from "~/utils";

export async function loader() {
  let exercises = await prisma.exercise.findMany();

  return json({ exercises });
}

export default function ExercisesLayout() {
  let user = useOptionalUser();
  let { exercises } = useLoaderData();

  return (
    <div>
      {user ? (
        <div className="mt-4">
          <div className="mt-4 flex space-x-4 overflow-x-scroll px-4 pb-4">
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
        <div className="mt-40 flex justify-center space-x-4 px-8">
          <Link
            className="block w-1/2 bg-gray-600 py-2 text-center font-medium text-white"
            to="/join"
          >
            Sign up
          </Link>
          <Link
            className="block w-1/2 bg-gray-600 py-2 text-center font-medium text-white"
            to="/login"
          >
            Log In
          </Link>
        </div>
      )}
    </div>
  );
}
