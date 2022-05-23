import { MinusIcon, PlusIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import timeAgo from "~/utils/time-ago";
import { AnimatePresence, motion } from "framer-motion";
import pluralize from "pluralize";

export async function loader({ request, params }) {
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
    <div className="my-6 px-4 pb-safe-bottom">
      {entries.length > 0 ? (
        <>
          <h1 className="text-3xl font-bold">Latest exercises</h1>

          <div className="mt-4 divide-y">
            {entries.map((entry) => (
              <EntryCard entry={entry} key={entry.id} />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-6">Choose an exercise.</p>
      )}
    </div>
  );
}

function EntryCard({ entry }) {
  let [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="relative w-full py-3 text-left"
      >
        <div>
          <p className="text-[15px]">
            <span className="text-lg font-semibold">{entry.exercise.name}</span>
            <span className="px-1 font-medium text-gray-500">&middot;</span>
            <span className="text-sm text-gray-500">{timeAgo(entry.date)}</span>
          </p>
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
          </motion.div>
        </div>
        <span className="absolute inset-y-0 right-0 flex items-center p-2">
          {!expanded ? (
            <PlusIcon className="h-4 w-4" />
          ) : (
            <MinusIcon className="h-4 w-4" />
          )}
        </span>
      </button>
    </div>
  );
}
