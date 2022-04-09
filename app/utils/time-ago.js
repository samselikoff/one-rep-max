import { formatDistanceToNowStrict, parseISO } from "date-fns";

export default function (date) {
  let time = formatDistanceToNowStrict(
    parseISO(date.substring(0, 10), "MMMM do"),
    {
      unit: "day",
      addSuffix: true,
    }
  );

  if (time === "0 days ago") {
    return "today";
  }
  return time;
}
