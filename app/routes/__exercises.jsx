import { Box, Link, TabNav, Theme } from "@radix-ui/themes";
import { json } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { prisma } from "~/db.server";
import { useOptionalUser } from "~/utils";

export async function loader() {
  let exercises = await prisma.exercise.findMany();

  return json({ exercises });
}

export default function ExercisesLayout() {
  let user = useOptionalUser();
  let { exercises } = useLoaderData();
  let params = useParams();

  return (
    <div>
      {user ? (
        <>
          <Theme appearance="dark">
            <Box pb="2">
              <TabNav.Root>
                {exercises.map((exercise) => (
                  <TabNav.Link
                    color="gray"
                    weight="medium"
                    wrap="nowrap"
                    asChild
                    active={params.exerciseId === exercise.id}
                    key={exercise.id}
                  >
                    <NavLink
                      // className={({ isActive }) =>
                      //   `${
                      //     isActive
                      //       ? "border-blue-500 text-white"
                      //       : "border-transparent text-gray-400"
                      //   }  whitespace-nowrap border-b-4 py-2.5 font-semibold`
                      // }
                      to={`/exercises/${exercise.id}`}
                      // key={exercise.id}
                    >
                      {exercise.name}
                    </NavLink>
                  </TabNav.Link>
                ))}
                {/* <nav className="scrollbar-hidden -mt-px flex overflow-x-scroll bg-gray-900">
                <div className="flex space-x-8 px-4">
                  {exercises.map((exercise) => (
                    <NavLink
                      className={({ isActive }) =>
                        `${
                          isActive
                            ? "border-blue-500 text-white"
                            : "border-transparent text-gray-400"
                        }  whitespace-nowrap border-b-4 py-2.5 font-semibold`
                      }
                      to={`/exercises/${exercise.id}`}
                      key={exercise.id}
                    >
                      {exercise.name}
                    </NavLink>
                  ))}
                </div>
              </nav> */}
              </TabNav.Root>
            </Box>
          </Theme>

          <Outlet />
        </>
      ) : (
        <div className="mt-40 flex justify-center space-x-4 px-8">
          <NavLink
            className="block w-1/2 bg-gray-600 py-2 text-center font-medium text-white"
            to="/join"
          >
            Sign up
          </NavLink>
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
