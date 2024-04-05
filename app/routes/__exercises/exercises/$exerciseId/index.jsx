import * as Icons from "@heroicons/react/24/outline";
import { differenceInDays, format, parseISO, sub } from "date-fns";
import { Link as RemixLink, useLoaderData, useParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import timeAgo from "~/utils/time-ago";
import pluralize from "pluralize";
import estimatedMax from "~/utils/estimated-max";
import Chart from "~/components/Chart";
import {
  Box,
  Em,
  Flex,
  Grid,
  Heading,
  IconButton,
  Link,
  Separator,
  Strong,
  Text,
} from "@radix-ui/themes";
import { PlusCircledIcon, PlusIcon } from "@radix-ui/react-icons";
import { Fragment } from "react";

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

      <Grid mt="6" columns="3">
        <HeaviestSetStat entries={entries} />
        <OneRepMaxStat entries={entries} />
        <FrequencyStat entries={entries} />
      </Grid>

      <Separator size="4" mt="6" />

      <Box mt="6">
        <Flex justify="between" align="center">
          <Heading as="h2" size="5">
            All entries
          </Heading>

          <IconButton asChild variant="ghost">
            <RemixLink to={`/exercises/${exercise.id}/new`}>
              <PlusIcon width="24" height="24" />
            </RemixLink>
          </IconButton>
        </Flex>

        {entries.length > 0 ? (
          <Flex mt="5" gap="4" direction="column">
            {entries.map((entry) => (
              <Fragment key={entry.id}>
                <Box>
                  <Flex gap="1" align="center">
                    <Text size="3" weight="bold">
                      {format(parseISO(entry.date.substring(0, 10)), "MMMM do")}
                    </Text>
                    <span>&middot;</span>
                    <Text size="1" color="gray" weight="medium">
                      {timeAgo(entry.date)}
                    </Text>
                  </Flex>
                  <Box mt="1">
                    {entry.sets.map((set) => (
                      <Text as="p" key={set.id}>
                        {set.weight} lbs – {pluralize("rep", set.reps, true)}
                        {set.tracked && " 👈"}
                      </Text>
                    ))}
                  </Box>

                  <Text size="2" color="gray" mt="3" as="p">
                    <Em>{entry.notes}</Em>
                  </Text>

                  <Flex mt="4" justify="end">
                    <Link size="2" color="gray" underline="always" asChild>
                      <RemixLink
                        to={`/exercises/${exerciseId}/entries/${entry.id}/edit`}
                      >
                        Edit this entry
                      </RemixLink>
                    </Link>
                  </Flex>
                </Box>

                <Separator size="4" color="gray" />
              </Fragment>
            ))}
          </Flex>
        ) : (
          <Text mt="6" as="p" color="gray">
            No entries.
          </Text>
        )}
      </Box>
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
    <Flex direction="column" align="center" gap="2">
      <Text
        mb="1"
        className="uppercase"
        size="1"
        weight="bold"
        color="gray"
        trim="end"
      >
        {title}
      </Text>

      {stat ? (
        <>
          <Text size="7" color="blue" weight="bold" trim="both">
            {stat}
            <Text size="4"> {statSuffix}</Text>
          </Text>
          <Text size="1" color="gray" trim="both" mt="1">
            <small>
              <Flex gap="1">{subItemsLabel}</Flex>
            </small>
          </Text>
        </>
      ) : (
        <Separator my="6" style={{ height: "3px" }} color="blue" size="2" />
      )}
    </Flex>
  );
}
