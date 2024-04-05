import * as Icons from "@heroicons/react/24/outline";
import { differenceInDays, format, parseISO, sub } from "date-fns";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import timeAgo from "~/utils/time-ago";
import pluralize from "pluralize";
import estimatedMax from "~/utils/estimated-max";
import Chart from "~/components/Chart";
import { Box, Flex, Heading, Separator, Text } from "@radix-ui/themes";

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
  });

  return json({ exercise, entries });
}

export default function ExerciseIndexPage() {
  let { exercise, entries } = useLoaderData();
  let { exerciseId } = useParams();

  return (
    <Box mt="5" px="4">
      <Heading>{exercise.name}</Heading>

      <Text
        as="p"
        align="center"
        mt="4"
        size="1"
        weight="medium"
        color="gray"
        className="uppercase"
      >
        Total lifted (lbs)
        {/* One Rep Max (Est) */}
      </Text>

      <Box height="160px" width="100%">
        <Text color="blue">
          <Chart entries={entries} />
        </Text>
      </Box>

      <Flex mt="6" justify="between" px="3">
        <HeaviestSetStat entries={entries} />
        <OneRepMaxStat entries={entries} />
        <FrequencyStat entries={entries} />
      </Flex>

      <Separator />

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
    </Box>
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

  return entryWithHeaviestSet ? (
    <Stat
      title="Heaviest set"
      stat={heaviestSet.weight}
      statSuffix="lbs"
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
  let allSets = entries.flatMap((entry) => entry.sets);
  let highestEstimatesOneRepMaxSet = allSets
    .filter((set) => set.reps > 0)
    .sort((a, b) => {
      return estimatedMax(a) > estimatedMax(b) ? -1 : 1;
    })[0];

  return highestEstimatesOneRepMaxSet ? (
    <Stat
      title="Top Est ORM"
      stat={Math.floor(estimatedMax(highestEstimatesOneRepMaxSet))}
      statSuffix="lbs"
      subItems={[
        `${highestEstimatesOneRepMaxSet.weight}lbs`,
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
    <Flex direction="column" align="center" gap="1">
      <Text className="uppercase" size="1" weight="medium" color="gray">
        {title}
      </Text>

      {stat ? (
        <Text size="7" color="blue" as="p" weight="bold">
          {stat}
          <Text size="4"> {statSuffix}</Text>
        </Text>
      ) : (
        <Flex align="center" height="100%">
          <Separator style={{ height: "3px" }} color="blue" size="2" />
        </Flex>
      )}

      <Text size="1" color="gray" weight="light">
        <Flex gap="1">{subItemsLabel}</Flex>
      </Text>
    </Flex>
  );
}
