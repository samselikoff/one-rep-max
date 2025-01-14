import { json } from "@remix-run/node";
import { Form, NavLink, useLoaderData, useParams } from "@remix-run/react";
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
import { useOptionalUser } from "~/utils";
import Header from "~/components/header";

export async function loader({ request }) {
  let userId = await requireUserId(request);

  let exercises = await prisma.exercise.findMany({
    orderBy: { createdAt: "asc" },
  });

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

  return json({ exercises, entries });
}

export default function ExercisesIndexPage() {
  let { entries, exercises } = useLoaderData();
  let user = useOptionalUser();
  let params = useParams();

  return (
    <>
      <Header>
        <NavLink className="text-2xl font-semibold text-white" end to=".">
          One Rep Max
        </NavLink>

        {user && (
          <Form action="/logout" method="post">
            <button className="text-sm text-gray-400" type="submit">
              Sign out
            </button>
          </Form>
        )}
      </Header>

      <main className="pb-safe-bottom">
        <div className="overflow-x-auto bg-gray-900 pb-2 [scrollbar-width:none]">
          <div className="flex gap-2">
            {exercises.map((exercise) => (
              <NavLink
                className={`${
                  params.exerciseId === exercise.id
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-400"
                } whitespace-nowrap border-b-2 px-2 py-2 text-sm font-medium`}
                key={exercise.id}
                to={`/exercises/${exercise.id}`}
              >
                {exercise.name}
              </NavLink>
            ))}
          </div>
        </div>
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
      </main>
    </>
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
