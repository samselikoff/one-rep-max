import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  IconButton,
  Link,
  Switch,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { Form, useTransition, Link as RemixLink } from "@remix-run/react";
import { format, formatDistanceToNow, parseISO, startOfToday } from "date-fns";
import { Fragment, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { usePreferredUnit } from "./exercise-settings";

export default function EntryForm({
  exercise,
  entry = null,
  lastEntry,
  lastTrackedEntry,
}) {
  let { convertTo, convertFrom, suffix, units } = usePreferredUnit();
  let formRef = useRef();
  let [sets, setSets] = useState(
    entry?.sets.length > 0
      ? entry.sets
      : [{ id: uuid(), weight: "", reps: "", tracked: false }]
  );
  let defaultDate = entry
    ? parseISO(entry.date.substring(0, 10))
    : startOfToday();

  let { state } = useTransition();
  let isSaving = state === "submitting" || state === "loading";

  return (
    <div className="mt-4">
      <Form method="post" ref={formRef}>
        <label>
          <div className="text-sm font-medium">Date</div>

          <input
            type="date"
            className="mt-2 w-full rounded border p-2"
            defaultValue={format(defaultDate, "yyyy-MM-dd")}
            name="date"
          />
        </label>

        <div className="mt-6">
          <div className="grid grid-cols-[40px_1fr_1fr_1fr_auto] items-center gap-2">
            <p className="text-sm font-medium">Set</p>
            <p className="text-sm font-medium capitalize">{units}</p>
            <div />
            <p className="text-center text-sm font-medium">Failure</p>
            <div />

            {sets.map((set, index) => (
              <Fragment key={set.id}>
                <p className="ml-1.5 tabular-nums text-gray-500">{index + 1}</p>
                <input
                  placeholder="Weight"
                  inputMode="decimal"
                  className="w-full rounded border px-2.5 py-1.5"
                  value={convertTo(set.weight)}
                  autoFocus={set === sets.at(-1)}
                  onChange={(e) => {
                    setSets((sets) => {
                      let newSets = [...sets];
                      let currentSet = newSets[index];
                      newSets[index] = {
                        ...currentSet,
                        weight: convertFrom(e.target.value),
                      };
                      return newSets;
                    });
                  }}
                />
                <input type="hidden" name="weight" value={set.weight} />
                <input
                  placeholder="Reps"
                  inputMode="numeric"
                  name="reps"
                  className="w-full rounded border px-2.5 py-1.5"
                  value={set.reps}
                  onChange={(e) => {
                    setSets((sets) => {
                      let newSets = [...sets];
                      let currentSet = newSets[index];
                      newSets[index] = {
                        ...currentSet,
                        reps: e.target.value,
                      };
                      return newSets;
                    });
                  }}
                />
                <Flex justify="center" align="center">
                  <Switch
                    name="trackingSet"
                    size="3"
                    value={index}
                    checked={set.tracked}
                    onCheckedChange={() => {
                      setSets((sets) =>
                        sets.map((set, i) => ({
                          ...set,
                          tracked: i === index ? !set.tracked : set.tracked,
                        }))
                      );
                    }}
                  />
                </Flex>
                <Flex justify="end" align="center">
                  <IconButton
                    onClick={() => {
                      setSets((sets) => sets.filter((s, i) => i !== index));
                    }}
                    disabled={sets.length === 1}
                    size="2"
                    color="gray"
                    variant="soft"
                    type="button"
                  >
                    <MinusIcon width="18" height="18" />
                  </IconButton>
                </Flex>
              </Fragment>
            ))}
          </div>

          <Flex mt="7" align="stretch" direction="column">
            <Button
              size="3"
              color="gray"
              variant="soft"
              type="button"
              onClick={() => {
                setSets((sets) => [
                  ...sets,
                  {
                    id: uuid(),
                    weight: sets[sets.length - 1].weight,
                    reps: sets[sets.length - 1].reps,
                    tracked: false,
                  },
                ]);
              }}
            >
              <PlusIcon />
              Add set
            </Button>
          </Flex>
        </div>

        <Box mt="6">
          <label>
            <Text mb="2" size="2" weight="medium" as="p">
              Notes
            </Text>

            <TextArea
              placeholder="How'd that feel?"
              defaultValue={entry?.notes || ""}
              name="notes"
              rows={4}
            />
          </label>
        </Box>

        <Flex mt="4" justify="between" align="center">
          <Link asChild size="2" weight="medium">
            <RemixLink to={`/exercises/${exercise.id}`}>Cancel</RemixLink>
          </Link>

          <Button size="3" type="submit" loading={isSaving}>
            Save
          </Button>
        </Flex>
      </Form>

      {lastEntry && (
        <Box pt="8">
          <Card variant="classic">
            <Flex justify="between">
              <Text size="1" color="gray">
                Previous {exercise.name}
              </Text>
              <Text size="1" color="gray">
                {formatDistanceToNow(parseISO(lastEntry.date.substring(0, 10)))}{" "}
                ago
              </Text>
            </Flex>
            <Box mt="4">
              {lastEntry.sets.map((set) => (
                <Text color="gray" key={set.id} as="p">
                  {convertTo(set.weight)} {suffix} - {set.reps} reps
                </Text>
              ))}
            </Box>
          </Card>
        </Box>
      )}
    </div>
  );
}
