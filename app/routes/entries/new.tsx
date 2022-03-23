import { format, startOfToday } from "date-fns";
import { Form, json, redirect } from "remix";
import { getUserId } from "~/session.server";

export async function loader({ request }) {
  const userId = await getUserId(request);
  if (!userId) return redirect("/");
  return json({});
}

export async function action() {
  //
}

export default function NewEntryPage() {
  return (
    <div className="px-4 mt-8">
      <h1 className="text-2xl font-semibold">New entry</h1>

      <Form className="mt-8 space-y-4" method="post">
        <div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-500">Exercise</span>
            <select className="w-full" name="" id="">
              <option value="1">Bench press</option>
              <option value="2">Squat</option>
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
              name=""
              id=""
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
            <textarea className="w-full" name="" id="" rows={5}></textarea>
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
