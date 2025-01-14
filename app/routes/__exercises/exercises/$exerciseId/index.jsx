import { DotsHorizontalIcon, PlusIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Popover,
  SegmentedControl,
  Text,
} from "@radix-ui/themes";
import { json } from "@remix-run/node";
import {
  Form,
  Link as RemixLink,
  useLoaderData,
  useParams,
  useTransition,
} from "@remix-run/react";
import { differenceInDays, format, parseISO, sub } from "date-fns";
import pluralize from "pluralize";
import { Fragment, useState } from "react";
import { OneRepMaxChart } from "~/components/charts";
import { usePreferredUnit } from "~/components/exercise-settings";
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
  let unit = formData.get("unit");

  if (typeof unit !== "string") {
    return null;
  }

  return await minDelay(
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
}

export default function ExerciseIndexPage() {
  let { convertTo, suffix } = usePreferredUnit();
  let { exercise, entries } = useLoaderData();
  let { exerciseId } = useParams();

  let settings = exercise.exerciseSettings[0];
  let [units, setUnits] = useState(settings ? settings.unit : "pounds");

  let { state } = useTransition();
  let isSaving = state === "submitting" || state === "loading";

  return (
    <div className="mt-5 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{exercise.name}</h1>

        {/* TODO */}
        <Popover.Root>
          <Popover.Trigger>
            <IconButton color="gray" radius="full" variant="surface" size="1">
              <DotsHorizontalIcon />
            </IconButton>
          </Popover.Trigger>
          <Popover.Content width="240px" align="end">
            <Text as="p" weight="medium" align="center">
              Settings
            </Text>
            <Box mt="3">
              <Form method="post">
                <Text as="label" size="2" weight="medium">
                  Units
                </Text>
                <Text mt="0" as="p" color="gray" size="1">
                  Update your preferred unit of weight for the current exercise.
                </Text>
                <Flex mt="2">
                  <SegmentedControl.Root
                    value={units}
                    onValueChange={setUnits}
                    style={{ width: "100%" }}
                  >
                    <SegmentedControl.Item name="unit" value="pounds">
                      Pounds
                    </SegmentedControl.Item>
                    <SegmentedControl.Item name="unit" value="kilos">
                      Kilos
                    </SegmentedControl.Item>
                  </SegmentedControl.Root>
                  <input type="hidden" name="unit" value={units} />
                </Flex>
                <Flex mt="7" justify="between" align="center">
                  <Popover.Close>
                    <Button color="gray" variant="ghost">
                      Cancel
                    </Button>
                  </Popover.Close>
                  <Button loading={isSaving} type="submit">
                    Update
                  </Button>
                </Flex>
              </Form>
            </Box>
          </Popover.Content>
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
          <h2 className="text-xl font-bold">All entries</h2>
          <RemixLink to={`/exercises/${exercise.id}/new`}>
            <PlusIcon className="text-blue-500" width="24" height="24" />
          </RemixLink>
        </div>

        {entries.length > 0 ? (
          <div className="mt-6 flex flex-col gap-4">
            {entries.map((entry) => (
              <Fragment key={entry.id}>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-bold">
                      {format(parseISO(entry.date.substring(0, 10)), "MMMM do")}
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
                    <RemixLink
                      className="text-sm text-gray-500 underline decoration-gray-300 decoration-1 underline-offset-2"
                      to={`/exercises/${exerciseId}/entries/${entry.id}/edit`}
                    >
                      Edit this entry
                    </RemixLink>
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
    .map((item, i) => <Text key={i}>{item}</Text>)
    .reduce((memo, item, i) => {
      return memo === null
        ? [item]
        : [memo, <Text key={`dot-${i}`}>&middot;</Text>, item];
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
          <div className="text-xs text-gray-500">
            <div className="flex gap-1">{subItemsLabel}</div>
          </div>
        </>
      ) : (
        <hr className="my-8 w-8 border-t-2 border-blue-200" />
      )}
    </div>
  );
}
