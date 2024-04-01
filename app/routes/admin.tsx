import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { getUser } from "~/session.server";

export async function loader({ request }: { request: Request }) {
  let user = await getUser(request);

  if (user?.email !== "sam.selikoff@gmail.com") {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  let exercises = await prisma.exercise.findMany();

  return json({ exercises });
}

export async function action({ request }: { request: Request }) {
  let user = await getUser(request);
  if (user?.email !== "sam.selikoff@gmail.com") {
    throw new Response(null, {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  let formData = await request.formData();
  let name = formData.get("name");

  if (typeof name !== "string" || name === "") {
    throw new Response(null, {
      status: 400,
      statusText: "Bad request",
    });
  }

  await prisma.exercise.create({
    data: { name },
  });

  return redirect(`/admin`);
}

export default function Page() {
  let { exercises } = useLoaderData<typeof loader>();

  return (
    <div className="m-4">
      <div className="space-y-4">
        {exercises.map((exercise) => (
          <p key={exercise.id}>{exercise.name}</p>
        ))}
      </div>

      <div className="mt-8">
        <Form method="post">
          <label>
            <input name="name" placeholder="New exercise name..." type="text" />
          </label>

          <div className="mt-2">
            <button
              className="rounded bg-sky-500 px-3 py-2 font-medium text-white"
              type="submit"
            >
              Save
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
