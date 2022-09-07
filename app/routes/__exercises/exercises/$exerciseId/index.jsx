import * as Icons from "@heroicons/react/24/outline";
import { differenceInDays, format, parseISO } from "date-fns";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import timeAgo from "~/utils/time-ago";
import pluralize from "pluralize";
import estimatedMax from "~/utils/estimated-max";
import Chart from "~/components/Chart";

export async function loader({ request, params }) {
  let userId = await requireUserId(request);

  let entries = await prisma.entry.findMany({
    where: { userId, exerciseId: params.exerciseId },
    include: {
      exercise: true,
      sets: true,
    },
    orderBy: { date: "desc" },
  });

  let exercise = await prisma.exercise.findUnique({
    where: { id: params.exerciseId },
  });

  return json({ exercise, entries });
}

export default function ExerciseIndexPage() {
  let { exercise, entries } = useLoaderData();
  let { exerciseId } = useParams();

  return (
    <div className="mt-6 px-4">
      <h1 className="text-3xl font-bold">{exercise.name}</h1>

      <p className="mt-6 text-center text-xs font-semibold uppercase text-gray-400">
        One Rep Max (Est)
      </p>
      <div className="h-40 w-full text-blue-500">
        <Chart entries={entries} />
      </div>

      <div className="mt-6 flex justify-between border-b px-2 pb-8">
        <HeaviestSetStat entries={entries} />
        <OneRepMaxStat entries={entries} />
        <FrequencyStat entries={entries} />
      </div>

      <div className="mt-6">
        <div className="flex justify-between">
          <p className="text-xl font-semibold">All entries</p>
          <Link
            className="flex h-8 w-8 items-center justify-center whitespace-nowrap rounded-full bg-blue-500 text-sm font-medium text-white"
            to={`/exercises/${exercise.id}/new`}
          >
            <Icons.PlusIcon className="h-5 w-5" />
          </Link>
        </div>

        {entries.length > 0 ? (
          <div className="divide-y">
            {entries.map((entry) => (
              <div key={entry.id} className="py-4">
                <div className="flex justify-between">
                  <p className="text-[15px]">
                    <span className="font-semibold">
                      {format(parseISO(entry.date.substring(0, 10)), "MMMM do")}
                    </span>
                    <span className="px-1 font-medium text-gray-500">
                      &middot;
                    </span>
                    <span className="text-sm text-gray-500">
                      {timeAgo(entry.date)}
                    </span>
                  </p>
                </div>
                <div className="mt-1">
                  {entry.sets.map((set) => (
                    <div key={set.id}>
                      <p>
                        {set.weight} lbs – {pluralize("rep", set.reps, true)}
                        {set.tracked && " 👈"}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-sm italic text-gray-700">
                  {entry.notes}
                </p>
                <div className="mt-4 text-right">
                  <Link
                    to={`/exercises/${exerciseId}/entries/${entry.id}/edit`}
                    className="text-right text-sm text-gray-500 underline"
                  >
                    Edit this entry
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6">No entries.</p>
        )}
      </div>
    </div>
  );
}

function HeaviestSetStat({ entries }) {
  let allSets = entries.flatMap((entry) => entry.sets);
  let heaviestSet = allSets
    .filter((set) => set.reps > 0)
    .sort((a, b) => {
      return +a.weight > +b.weight ? -1 : 1;
    })[0];
  let entryWithHeaviestSet = entries.find((entry) => {
    return entry.sets.includes(heaviestSet);
  });

  return (
    <div>
      <p className="text-center text-xs font-semibold uppercase text-gray-500">
        Heaviest set
      </p>
      {entryWithHeaviestSet ? (
        <>
          <p className="text-center font-semibold">
            <span className="text-3xl text-blue-500">{heaviestSet.weight}</span>
            <span className="pl-0.5 text-lg text-blue-500">lbs</span>
          </p>
          <p className="pt-0.5 text-center text-[10px] leading-none text-gray-500">
            <span>{pluralize("rep", heaviestSet.reps, true)}</span>
            <span className="px-0.5 font-medium">&middot;</span>
            <span>{timeAgo(entryWithHeaviestSet.date)}</span>
          </p>
        </>
      ) : (
        <>
          <p className="flex items-center text-3xl text-blue-500">
            <span className="block h-1 w-8 bg-blue-500" />
            &nbsp;
          </p>
        </>
      )}
    </div>
  );
}

function OneRepMaxStat({ entries }) {
  let allSets = entries.flatMap((entry) => entry.sets);
  let highestEstimatesOneRepMaxSet = allSets
    .filter((set) => set.reps > 0)
    .sort((a, b) => {
      return estimatedMax(a) > estimatedMax(b) ? -1 : 1;
    })[0];

  return (
    <div>
      <p className="text-center text-xs font-semibold uppercase text-gray-500">
        Top Est ORM
      </p>
      {highestEstimatesOneRepMaxSet ? (
        <>
          <p className="text-center font-semibold">
            <span className="text-3xl text-blue-500">
              {Math.floor(estimatedMax(highestEstimatesOneRepMaxSet))}
            </span>
            <span className="pl-0.5 text-lg text-blue-500">lbs</span>
          </p>
          <p className="pt-0.5 text-center text-xs text-[10px] leading-none text-gray-500">
            <span>{highestEstimatesOneRepMaxSet.weight}lbs</span>
            <span className="px-0.5 font-medium">&middot;</span>
            <span>
              {pluralize("rep", highestEstimatesOneRepMaxSet.reps, true)}
            </span>
          </p>
        </>
      ) : (
        <>
          <p className="flex items-center text-3xl text-blue-500">
            <span className="block h-1 w-8 bg-blue-500" />
            &nbsp;
          </p>
        </>
      )}
    </div>
  );
}

function FrequencyStat({ entries }) {
  let last30DaysEntries = entries.filter((entry) => {
    let daysSinceEntry = differenceInDays(
      new Date(),
      parseISO(entry.date.substring(0, 10), "MMMM do")
    );
    return daysSinceEntry < 30;
  });

  return (
    <div>
      <p className="text-center text-xs font-semibold uppercase text-gray-500">
        Frequency
      </p>
      <p className="text-center font-semibold">
        <span className="text-3xl text-blue-500">
          {last30DaysEntries.length}
        </span>
        <span className="pl-0.5 text-lg text-blue-500">
          {pluralize("lift", last30DaysEntries.length)}
        </span>
      </p>
      <p className="pt-0.5 text-center text-xs text-[10px] leading-none text-gray-500">
        <span>Past 30 days</span>
      </p>
    </div>
  );
}
