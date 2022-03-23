import { format, startOfToday } from "date-fns";
import { Form, json, redirect, useLoaderData } from "remix";
import { prisma } from "~/db.server";
import { getUserId, requireUserId } from "~/session.server";

export async function loader({ request }) {
  let userId = await getUserId(request);
  if (!userId) return redirect("/");

  let exercises = await prisma.exercise.findMany({});

  return json({ exercises });
}

export async function action({ request }) {
  let userId = await requireUserId(request);

  let formData = await request.formData();
  let exerciseId = formData.get("exerciseId");
  let date = formData.get("date");
  let notes = formData.get("notes");

  await prisma.entry.create({
    data: {
      userId,
      exerciseId,
      date: `${date}T00:00:00.000Z`,
      notes,
    },
  });

  return redirect(`/`);

  // if (typeof title !== "string" || title.length === 0) {
  //   return json(
  //     { errors: { title: "Title is required" } },
  //     { status: 400 }
  //   );
  // }

  // if (typeof body !== "string" || body.length === 0) {
  //   return json(
  //     { errors: { body: "Body is required" } },
  //     { status: 400 }
  //   );
  // }

  // let note = await createNote({ title, body, userId });

  // return redirect(`/notes/${note.id}`);
}

export default function NewEntryPage() {
  let { exercises } = useLoaderData();

  return (
    <div className="px-4 mt-8">
      <h1 className="text-2xl font-semibold">New entry</h1>

      <Form className="mt-8 space-y-4" method="post">
        <div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-500">Exercise</span>
            <select className="w-full" name="exerciseId" id="">
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-500">Date</span>
            <input
              defaultValue={format(startOfToday(), "yyyy-MM-dd")}
              className="w-full"
              type="date"
              name="date"
            />
          </label>
        </div>

        {/*
        Not yet!

        <div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-500">Sets</span>
            <input
              defaultValue={format(startOfToday(), "yyyy-MM-dd")}
              className="w-full"
              type="date"
              name=""
              id=""
            />
          </label>
        </div>
        */}

        <div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-500">Notes</span>
            <textarea className="w-full" name="notes" rows={5}></textarea>
          </label>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-5 py-2 text-white bg-gray-600">
            Save
          </button>
        </div>
      </Form>
    </div>
  );
}
