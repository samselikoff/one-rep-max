import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Flex,
  Grid,
  IconButton,
  Switch,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { Form, useTransition } from "@remix-run/react";
import { format, formatDistanceToNow, parseISO, startOfToday } from "date-fns";
import { Fragment, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

export default function EntryForm({
  exercise,
  entry = null,
  lastEntry,
  lastTrackedEntry,
}) {
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
    <Box mt="4">
      <Form method="post" ref={formRef}>
        <label>
          <Text size="2" weight="medium" as="div" mb="2">
            Date
          </Text>

          <TextField.Root
            type="date"
            size="3"
            placeholder="Search the docs…"
            defaultValue={format(defaultDate, "yyyy-MM-dd")}
            name="date"
          />
        </label>

        <Box mt="6">
          <Text size="2" weight="medium" as="p">
            Sets
          </Text>

          <Grid columns="40px 1fr 1fr 1fr auto" align="center" gap="2">
            <div />
            <Text weight="light" size="1">
              WEIGHT
            </Text>
            <Text weight="light" size="1">
              REPS
            </Text>
            <Text weight="light" align="center" size="1">
              FAILURE
            </Text>
            <div />

            {sets.map((set, index) => (
              <Fragment key={set.id}>
                <Text size="1" weight="light">
                  {index + 1}
                </Text>
                <TextField.Root
                  size="3"
                  placeholder="Weight"
                  name="weight"
                  inputMode="decimal"
                  value={set.weight}
                  autoFocus={set === sets.at(-1)}
                  onChange={(e) => {
                    setSets((sets) => {
                      let newSets = [...sets];
                      let currentSet = newSets[index];
                      newSets[index] = {
                        ...currentSet,
                        weight: e.target.value,
                      };
                      return newSets;
                    });
                  }}
                />
                <TextField.Root
                  size="3"
                  placeholder="Reps"
                  inputMode="numeric"
                  name="reps"
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
                    size="3"
                    color="gray"
                    variant="soft"
                    type="button"
                  >
                    <MinusIcon width="18" height="18" />
                  </IconButton>
                </Flex>
              </Fragment>
            ))}
          </Grid>

          <Flex mt="6" align="stretch" direction="column">
            <Button
              size="2"
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
        </Box>

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

        <Flex mt="4" justify="end">
          <Button size="3" type="submit" loading={isSaving}>
            Save
          </Button>
        </Flex>
      </Form>

      {lastEntry && (
        <div className="pt-4 pb-8">
          <div className="my-4 bg-gray-200 p-4 text-sm text-gray-700">
            <div className="flex justify-between">
              <p className="font-medium">Previous {exercise.name}</p>
              <p>
                {formatDistanceToNow(parseISO(lastEntry.date.substring(0, 10)))}{" "}
                ago
              </p>
            </div>
            <div className="mt-4">
              <ul>
                {lastEntry.sets.map((set) => (
                  <li key={set.id}>
                    {set.weight} lbs - {set.reps} reps
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}
