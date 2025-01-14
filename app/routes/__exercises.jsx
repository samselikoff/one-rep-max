import { json } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { prisma } from "~/db.server";

export async function loader() {
  let exercises = await prisma.exercise.findMany({
    orderBy: { createdAt: "asc" },
  });

  return json({ exercises });
}

export default function ExercisesLayout() {
  let { exercises } = useLoaderData();
  let params = useParams();

  return (
    <>
      <div className="overflow-x-auto bg-gray-900 pb-2 [scrollbar-width:none]">
        <div className="flex gap-2">
          {exercises.map((exercise) => (
            <NavLink
              className={`${
                params.exerciseId === exercise.id
                  ? "border-blue-500 text-white"
                  : "border-transparent text-gray-400"
              } whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium`}
              key={exercise.id}
              to={`/exercises/${exercise.id}`}
            >
              {exercise.name}
            </NavLink>
          ))}
        </div>
      </div>

      <Outlet />
    </>
  );
}
