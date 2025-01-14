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
    <div className="my-5 px-4">
      {entries.length > 0 ? (
        <>
          <h1 className="text-2xl font-semibold">Latest exercises</h1>
          <div className="mt-6 flex flex-col gap-4">
            {entries.map((entry) => (
              <ExerciseSettingsProvider
                units={entry.exercise.exerciseSettings[0]?.unit || "pounds"}
                key={entry.id}
              >
                <EntryCard entry={entry} />
              </ExerciseSettingsProvider>
            ))}
          </div>
        </>
      ) : (
        <p>Choose an exercise.</p>
      )}
    </div>
  );
}

function EntryCard({ entry }) {
  let { convertTo, suffix } = usePreferredUnit();
  let [expanded, setExpanded] = useState(false);

  return (
    <>
      <button className="text-left" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">{entry.exercise.name}</p>
          <p className="text-xs text-gray-500">{timeAgo(entry.date)}</p>
        </div>

        <div>
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
                      <span>
                        {convertTo(set.weight)} {suffix} –{" "}
                        {pluralize("rep", set.reps, true)}
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
                  <div className="mt-4">
                    <p className="text-gray-400">
                      <em>{entry.notes}</em>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </button>

      <hr />
    </>
  );
}
