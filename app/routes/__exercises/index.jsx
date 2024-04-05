import { Box, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import timeAgo from "~/utils/time-ago";

export async function loader({ request }) {
  let userId = await requireUserId(request);

  let entries = await prisma.entry.findMany({
    where: { userId },
    include: {
      exercise: true,
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
    <Box px="4" my="5" className="pb-safe-bottom">
      {entries.length > 0 ? (
        <>
          <Heading>Latest exercises</Heading>

          <Flex mt="6" direction="column" gap="4">
            {entries.map((entry) => (
              <EntryCard entry={entry} key={entry.id} />
            ))}
          </Flex>
        </>
      ) : (
        <p className="mt-6">Choose an exercise.</p>
      )}
    </Box>
  );
}

function EntryCard({ entry }) {
  // let [expanded, setExpanded] = useState(false);

  return (
    <>
      <Flex justify="between" align="center">
        <Text weight="bold" size="4">
          {entry.exercise.name}
        </Text>
        <Text size="1" color="gray">
          {timeAgo(entry.date)}
        </Text>
      </Flex>

      <Separator size="4" />

      {/* <motion.div layout="position" className="overflow-hidden">
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
                <motion.p
                  variants={{
                    hidden: {
                      opacity: 0,
                      transition: { type: "spring", duration: 0.35 },
                    },
                    visible: { opacity: 1 },
                  }}
                >
                  <span>
                    {set.weight} lbs – {pluralize("rep", set.reps, true)}
                  </span>
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
                </motion.p>
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
              className="text-xs italic text-gray-500"
            >
              <p className="pt-1">{entry.notes}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div> */}
    </>
  );
}
