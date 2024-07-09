import {
  Box,
  Em,
  Flex,
  Heading,
  Reset,
  Separator,
  Text,
} from "@radix-ui/themes";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import timeAgo from "~/utils/time-ago";
import pluralize from "pluralize";
import { AnimatePresence, motion } from "framer-motion";
import {
  ExerciseSettingsProvider,
  usePreferredUnit,
} from "~/components/exercise-settings";

export async function loader({ request }) {
  let userId = await requireUserId(request);

  let entries = await prisma.entry.findMany({
    where: { userId },
    include: {
      exercise: {
        include: {
          exerciseSettings: true,
        },
      },
      sets: true,
    },
    orderBy: { date: "desc" },
    take: 15,
  });

  return json({ entries });
}

export default function ExercisesIndexPage() {
  let { entries } = useLoaderData();

  return (
    <Box px="4" my="5">
      {entries.length > 0 ? (
        <>
          <Heading>Latest exercises</Heading>
          <Flex mt="6" direction="column" gap="4">
            {entries.map((entry) => (
              <ExerciseSettingsProvider
                units={entry.exercise.exerciseSettings[0]?.unit || "pounds"}
                key={entry.id}
              >
                <EntryCard entry={entry} />
              </ExerciseSettingsProvider>
            ))}
          </Flex>
        </>
      ) : (
        <Text>Choose an exercise.</Text>
      )}
    </Box>
  );
}

function EntryCard({ entry }) {
  let { convertTo, suffix } = usePreferredUnit();
  let [expanded, setExpanded] = useState(false);

  return (
    <>
      <Reset>
        <button onClick={() => setExpanded(!expanded)}>
          <Flex justify="between" align="center">
            <Text weight="bold" size="4">
              {entry.exercise.name}
            </Text>
            <Text size="1" color="gray">
              {timeAgo(entry.date)}
            </Text>
          </Flex>

          <Box>
            <motion.div layout="position" className="overflow-hidden">
              <AnimatePresence initial={false}>
                {entry.sets
                  .filter((set) => (!expanded ? set.tracked : true))
                  .map((set) => (
                    <motion.div
                      layout="position"
                      variants={{
                        hidden: { height: 0 },
                        visible: { height: "auto" },
                      }}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      key={set.id}
                    >
                      <motion.div
                        variants={{
                          hidden: {
                            opacity: 0,
                            transition: { type: "spring", duration: 0.35 },
                          },
                          visible: { opacity: 1 },
                        }}
                      >
                        <Text>
                          {convertTo(set.weight)} {suffix} –{" "}
                          {pluralize("rep", set.reps, true)}
                        </Text>
                        <AnimatePresence>
                          {expanded && set.tracked && (
                            <motion.span
                              key={set.id}
                              initial={{ opacity: 0 }}
                              exit={{
                                opacity: 0,
                                transition: { type: "spring", duration: 0.4 },
                              }}
                              animate={{ opacity: 1 }}
                            >
                              {" "}
                              👈
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </motion.div>
                  ))}
                {expanded && entry.notes && (
                  <motion.div
                    layout="position"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      transition: { type: "spring", duration: 0.4 },
                    }}
                  >
                    <Box pt="4">
                      <Text size="2" color="gray">
                        <Em>{entry.notes}</Em>
                      </Text>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Box>
        </button>
      </Reset>

      <Separator size="4" />
    </>
  );
}
