import { Box, TabNav, Theme } from "@radix-ui/themes";
import { json } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { prisma } from "~/db.server";

export async function loader() {
  let exercises = await prisma.exercise.findMany();

  return json({ exercises });
}

export default function ExercisesLayout() {
  let { exercises } = useLoaderData();
  let params = useParams();

  return (
    <>
      <Theme appearance="dark">
        <Box pb="2" overflow="visible">
          <TabNav.Root>
            {exercises.map((exercise) => (
              <TabNav.Link
                asChild
                active={params.exerciseId === exercise.id}
                key={exercise.id}
              >
                <NavLink to={`/exercises/${exercise.id}`}>
                  {exercise.name}
                </NavLink>
              </TabNav.Link>
            ))}
          </TabNav.Root>
        </Box>
      </Theme>

      <Outlet />
    </>
  );
}
