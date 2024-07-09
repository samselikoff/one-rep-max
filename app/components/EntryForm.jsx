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
import { usePreferredUnit } from "~/routes/__exercises/exercises/$exerciseId";

export default function EntryForm({
  exercise,
  entry = null,
  lastEntry,
  lastTrackedEntry,
}) {
  let { convertTo, convertFrom, units } = usePreferredUnit();
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
          <Grid columns="40px 1fr 1fr 1fr auto" align="center" gap="2">
            <Text size="2" weight="medium">
              Set
            </Text>
            <Text
              size="2"
              weight="medium"
              style={{ textTransform: "capitalize" }}
            >
              {units}
            </Text>
            <div />
            <Text weight="medium" size="2" align="center">
              Failure
            </Text>
            <div />

            {sets.map((set, index) => (
              <Fragment key={set.id}>
                <Text size="3" color="gray" ml="2" className="tabular-nums">
                  {index + 1}
                </Text>
                <TextField.Root
                  size="3"
                  placeholder="Weight"
                  inputMode="decimal"
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
          </Grid>

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
                  {set.weight} lbs - {set.reps} reps
                </Text>
              ))}
            </Box>
          </Card>
        </Box>
      )}
    </Box>
  );
}
