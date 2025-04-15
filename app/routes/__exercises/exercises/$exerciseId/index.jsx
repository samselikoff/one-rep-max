import { PlusIcon } from "@heroicons/react/16/solid";
import { ChevronLeftIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useParams,
  useTransition,
} from "@remix-run/react";
import { differenceInDays, format, parseISO, sub } from "date-fns";
import assert from "assert";
import pluralize from "pluralize";
import { Fragment } from "react";
import { OneRepMaxChart } from "~/components/charts";
import { usePreferredUnit } from "~/components/exercise-settings";
import Header from "~/components/header";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import estimatedMax from "~/utils/estimated-max";
import { minDelay } from "~/utils/minDelay";
import timeAgo from "~/utils/time-ago";

export async function loader({ request, params }) {
  let userId = await requireUserId(request);

  let entries = await prisma.entry.findMany({
    where: {
      userId,
      exerciseId: params.exerciseId,
      date: { gte: sub(new Date(), { months: 6 }) },
    },
    include: {
      exercise: true,
      sets: true,
    },
    orderBy: { date: "desc" },
  });

  let exercise = await prisma.exercise.findUnique({
    where: { id: params.exerciseId },
    include: {
      exerciseSettings: { where: { userId } },
    },
  });

  if (!exercise) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  return json({ exercise, entries });
}

export async function action({ request, params }) {
  let userId = await requireUserId(request);
  let formData = await request.formData();
  let { _action, ...rest } = Object.fromEntries(formData);

  switch (_action) {
    case "UPDATE_EXERCISE_SETTINGS":
      let { unit } = rest;
      assert(typeof unit === "string");

      await minDelay(
        prisma.exerciseSettings.upsert({
          create: {
            unit,
            userId,
            exerciseId: params.exerciseId,
          },
          update: {
            unit,
          },
          where: {
            userId_exerciseId: {
              userId,
              exerciseId: params.exerciseId,
            },
          },
        }),
        750
      );

      return redirect(`/exercises/${params.exerciseId}`);

    default:
      throw new Error("Unimplemented");
  }
}

export default function ExerciseIndexPage() {
  let { convertTo, suffix } = usePreferredUnit();
  let { exercise, entries } = useLoaderData();
  let { exerciseId } = useParams();

  let settings = exercise.exerciseSettings[0];
  const defaultUnit = settings ? settings.unit : "pounds";

  let { state } = useTransition();
  let isSaving = state === "submitting" || state === "loading";

  return (
    <>
      <Header>
        <Link
          className="inline-flex items-center text-sm font-medium text-blue-500"
          to="/"
        >
          <ChevronLeftIcon width="20" height="20" />
          Home
        </Link>

        <h1 className="absolute left-1/2 -translate-x-1/2 font-semibold leading-5 text-white">
          {exercise.name}
        </h1>
      </Header>

      <main className="pb-safe-bottom">
        <div className="mt-5 px-4">
          <div className="flex items-center justify-end">
            <Popover.Root>
              <Popover.Trigger className="rounded-full border border-gray-300 p-1">
                <DotsHorizontalIcon />
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="w-[240px] rounded border bg-white p-4 shadow-xl shadow-black/25"
                  align="end"
                >
                  <p className="text-center font-medium">Settings</p>
                  <div className="mt-2">
                    <Form method="post">
                      <input
                        type="hidden"
                        name="_action"
                        value="UPDATE_EXERCISE_SETTINGS"
                      />
                      <p className="text-sm font-medium">Units</p>
                      <p className="text-xs text-gray-500">
                        Update your preferred unit of weight for the current
                        exercise.
                      </p>
                      <div className="mt-4 flex gap-6 text-sm">
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            defaultChecked={defaultUnit === "pounds"}
                            value="pounds"
                            name="unit"
                          />
                          Pounds
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            defaultChecked={defaultUnit === "kilos"}
                            value="kilos"
                            name="unit"
                          />
                          Kilos
                        </label>
                      </div>
                      <div className="mt-8 flex items-center justify-between">
                        <Popover.Close className="text-sm text-gray-500">
                          Cancel
                        </Popover.Close>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                        >
                          Update
                        </button>
                      </div>
                    </Form>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
          <p className="mt-4 text-center text-xs font-medium uppercase text-gray-500">
            {/* Total lifted (lbs) */}
            One Rep Max (Est)
          </p>
          <div className="h-[160px] w-full text-blue-500">
            <OneRepMaxChart entries={entries} />
          </div>
          <div className="mt-6 grid grid-cols-3">
            <HeaviestSetStat entries={entries} />
            <OneRepMaxStat entries={entries} />
            <FrequencyStat entries={entries} />
          </div>
          <hr className="mt-8" />
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Logs</h2>

              <Link to={`/exercises/${exercise.id}/new`}>
                <PlusIcon className="text-blue-500" width="20" height="20" />
              </Link>
            </div>

            {entries.length > 0 ? (
              <div className="mt-6 flex flex-col gap-4">
                {entries.map((entry) => (
                  <Fragment key={entry.id}>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-bold">
                          {format(
                            parseISO(entry.date.substring(0, 10)),
                            "MMMM do"
                          )}
                        </p>
                        <span>&middot;</span>
                        <p className="text-xs font-medium text-gray-500">
                          {timeAgo(entry.date)}
                        </p>
                      </div>
                      <div className="mt-1">
                        {entry.sets.map((set) => (
                          <p key={set.id}>
                            {convertTo(set.weight)} {suffix} –{" "}
                            {pluralize("rep", set.reps, true)}
                            {set.tracked && " 👈"}
                          </p>
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-gray-500">
                        <em>{entry.notes}</em>
                      </p>
                      <div className="mt-4 flex justify-end">
                        <Link
                          className="text-sm text-gray-500 underline decoration-gray-300 decoration-1 underline-offset-2"
                          to={`/exercises/${exerciseId}/entries/${entry.id}/edit`}
                        >
                          Edit this entry
                        </Link>
                      </div>
                    </div>
                    <hr />
                  </Fragment>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-gray-500">No entries.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function HeaviestSetStat({ entries }) {
  let { convertTo, suffix } = usePreferredUnit();
  let allSets = entries.flatMap((entry) => entry.sets);
  let heaviestSet = allSets
    .filter((set) => set.reps > 0)
    .sort((a, b) => {
      return +a.weight > +b.weight ? -1 : 1;
    })[0];
  let entryWithHeaviestSet = entries.find((entry) => {
    return entry.sets.includes(heaviestSet);
  });

  return entryWithHeaviestSet ? (
    <Stat
      title="Heaviest set"
      stat={convertTo(heaviestSet.weight)}
      statSuffix={suffix}
      subItems={[
        pluralize("rep", heaviestSet.reps, true),
        timeAgo(entryWithHeaviestSet.date),
      ]}
    />
  ) : (
    <Stat title="Heaviest set" />
  );
}

function OneRepMaxStat({ entries }) {
  let { convertTo, suffix } = usePreferredUnit();
  let allSets = entries.flatMap((entry) => entry.sets);
  let highestEstimatesOneRepMaxSet = allSets
    .filter((set) => set.reps > 0)
    .sort((a, b) => {
      return estimatedMax(a) > estimatedMax(b) ? -1 : 1;
    })[0];

  return highestEstimatesOneRepMaxSet ? (
    <Stat
      title="Top Est ORM"
      stat={convertTo(Math.floor(estimatedMax(highestEstimatesOneRepMaxSet)))}
      statSuffix={suffix}
      subItems={[
        `${convertTo(highestEstimatesOneRepMaxSet.weight)}${suffix}`,
        pluralize("rep", highestEstimatesOneRepMaxSet.reps, true),
      ]}
    />
  ) : (
    <Stat title="Top Est ORM" />
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
    <Stat
      title="Frequency"
      stat={last30DaysEntries.length}
      statSuffix={pluralize("lift", last30DaysEntries.length)}
      subItems={["Past 30 days"]}
    />
  );
}

function Stat({ title, stat, statSuffix, subItems = [] }) {
  let subItemsLabel = subItems
    .map((item, i) => <p key={i}>{item}</p>)
    .reduce((memo, item, i) => {
      return memo === null
        ? [item]
        : [memo, <p key={`dot-${i}`}>&middot;</p>, item];
    }, null);

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs font-bold uppercase text-gray-500">{title}</p>

      {stat ? (
        <>
          <p className="text-2xl font-bold text-blue-500">
            {stat}
            <span className="ml-0.5 text-sm font-medium">{statSuffix}</span>
          </p>
          <div className="text-[10px] text-gray-500">
            <div className="flex gap-1">{subItemsLabel}</div>
          </div>
        </>
      ) : (
        <hr className="my-8 w-8 border-t-2 border-blue-200" />
      )}
    </div>
  );
}
