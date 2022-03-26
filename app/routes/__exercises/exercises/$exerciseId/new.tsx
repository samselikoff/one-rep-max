// @ts-nocheck
import { format, startOfToday } from "date-fns";
import { useRef, useState } from "react";
import { Form, json, redirect, useLoaderData } from "remix";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }) {
  let exercise = await prisma.exercise.findFirst({
    where: { id: params.exerciseId },
  });

  return json({ exercise });
}

export async function action({ request, params }) {
  let userId = await requireUserId(request);
  let formData = await request.formData();
  let exerciseId = params.exerciseId;
  let date = formData.get("date");
  let notes = formData.get("notes");
  let weights = formData.getAll("weight");
  let reps = formData.getAll("reps");
  let data = {
    userId,
    exerciseId,
    date: `${date}T00:00:00.000Z`,
    notes,
    sets: { create: [] },
  };
  weights.forEach((weight, i) => {
    data.sets.create.push({ weight: +weight, reps: +reps[i] });
  });

  await prisma.entry.create({ data });

  return redirect(`/exercises/${exerciseId}`);
}

export default function NewEntryPage() {
  let { exercise } = useLoaderData();
  let [sets, setSets] = useState(1);
  let formRef = useRef();

  let defaultWeight = "";
  let defaultReps = "";
  if (formRef.current) {
    let formDataa = new FormData(formRef.current);
    let weights = formDataa.getAll("weight");
    let reps = formDataa.getAll("reps");
    defaultWeight = weights[weights.length - 1];
    defaultReps = reps[reps.length - 1];
  }

  return (
    <div className="px-4 mt-4">
      <h1 className="text-2xl font-semibold">{exercise.name} – New entry</h1>

      <Form ref={formRef} className="mt-4 space-y-4" method="post">
        <div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Date</span>
            <input
              defaultValue={format(startOfToday(), "yyyy-MM-dd")}
              className="w-full border-gray-300"
              type="date"
              name="date"
            />
          </label>
        </div>

        <div>
          <div className="space-y-2">
            <ol className="space-y-2 list-decimal list-inside">
              {[...Array(sets).keys()]
                .map((i) => +i + 1)
                .map((set) => (
                  <li key={set} className="flex items-center space-x-3">
                    <span className="flex-1 text-sm font-medium text-gray-700 whitespace-nowrap">
                      Set {set}
                    </span>
                    <div className="w-full">
                      <div>
                        <div className="flex">
                          <input
                            type="text"
                            name="weight"
                            className="z-0 flex-1 block w-full min-w-0 px-3 py-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="135"
                            defaultValue={defaultWeight}
                          />
                          <span className="inline-flex items-center px-3 text-gray-500 border border-l-0 border-gray-300 bg-gray-50 sm:text-sm">
                            lbs
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full">
                      <input
                        placeholder="Reps"
                        className="w-full border-gray-300"
                        type="number"
                        name="reps"
                        defaultValue={defaultReps}
                      />
                    </div>
                  </li>
                ))}
            </ol>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setSets(sets + 1)}
              type="button"
              className="w-full text-sm font-medium text-gray-900 bg-gray-300 h-11"
            >
              + Add set
            </button>
          </div>
        </div>

        <div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-500">Notes</span>
            <textarea className="w-full" name="notes" rows={4}></textarea>
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
