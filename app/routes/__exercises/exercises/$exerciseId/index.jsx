import { PencilAltIcon } from "@heroicons/react/outline";
import {
  differenceInDays,
  format,
  formatDistanceToNow,
  formatDistanceToNowStrict,
  parseISO,
} from "date-fns";
import { json, Link, useLoaderData, useParams } from "remix";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

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

  let exercise = await prisma.exercise.findFirst({
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

      <div className="mt-4 flex border-b pb-8">
        <div className="w-1/3">
          <HeaviestSetStat entries={entries} />
        </div>
        <div className="w-1/3">
          <OneRepMaxStat entries={entries} />
        </div>
        <div className="w-1/3">
          <FrequencyStat entries={entries} />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between">
          <p className="text-xl font-semibold">All entries</p>
          <Link
            className="flex items-center whitespace-nowrap p-1 text-sm font-medium text-blue-500"
            to={`/exercises/${exercise.id}/new`}
          >
            <PencilAltIcon className="h-5 w-5" />
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
                      {formatDistanceToNow(
                        parseISO(entry.date.substring(0, 10)),
                        "MMMM do"
                      )}{" "}
                      ago
                    </span>
                  </p>
                </div>
                <div className="mt-1">
                  {entry.sets.map((set) => (
                    <div key={set.id}>
                      <p>
                        {set.weight} lbs – {set.reps} reps
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

function estimatedMax(set) {
  // Jim Wendler formula
  // return +set.weight * +set.reps * 0.0333 + +set.weight;

  // Brzycki formula
  return set.weight / (1.0278 - 0.0278 * set.reps);
}

function HeaviestSetStat({ entries }) {
  let allSets = entries.flatMap((entry) => entry.sets);
  let heaviestSet = allSets.sort((a, b) => {
    return +a.weight > +b.weight ? -1 : 1;
  })[0];
  let entryWithHeaviestSet = entries.find((entry) => {
    return entry.sets.includes(heaviestSet);
  });

  return (
    <div>
      <p className="text-xs font-semibold uppercase text-gray-500">
        Heaviest set
      </p>
      {entryWithHeaviestSet ? (
        <>
          <p className="font-semibold ">
            <span className="text-3xl text-blue-500">{heaviestSet.weight}</span>
            <span className="pl-0.5 text-lg text-blue-500">lbs</span>
          </p>
          <p className="text-xs leading-none text-gray-500">
            <span>{heaviestSet.reps} reps</span>
            <span className="px-0.5 font-medium">&middot;</span>
            <span>
              {formatDistanceToNowStrict(
                parseISO(entryWithHeaviestSet.date.substring(0, 10), "MMMM do"),
                {
                  addSuffix: true,
                  unit: "day",
                }
              )}
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

function OneRepMaxStat({ entries }) {
  let allSets = entries.flatMap((entry) => entry.sets);
  let highestEstimatesOneRepMaxSet = allSets.sort((a, b) => {
    return estimatedMax(a) > estimatedMax(b) ? -1 : 1;
  })[0];

  return (
    <div>
      <p className="text-xs font-semibold uppercase text-gray-500">
        Estimated 1RM
      </p>
      {highestEstimatesOneRepMaxSet ? (
        <>
          <p className="font-semibold">
            <span className="text-3xl text-blue-500">
              {Math.floor(estimatedMax(highestEstimatesOneRepMaxSet))}
            </span>
            <span className="pl-0.5 text-lg text-blue-500">lbs</span>
          </p>
          <p className="text-xs leading-none text-gray-500">
            <span>{highestEstimatesOneRepMaxSet.weight}lbs</span>
            <span className="px-0.5 font-medium">&middot;</span>
            <span>{highestEstimatesOneRepMaxSet.reps} reps</span>
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
      <p className="text-xs font-semibold uppercase text-gray-500">Frequency</p>
      <p className="font-semibold ">
        <span className="text-3xl text-blue-500">
          {last30DaysEntries.length}
        </span>
        <span className="pl-0.5 text-lg text-blue-500">
          {last30DaysEntries.length === 1 ? "lift" : "lifts"}
        </span>
      </p>
      <p className="text-xs leading-none text-gray-500">
        <span>Past 30 days</span>
      </p>
    </div>
  );
}
