import { formatDistanceToNowStrict, isToday, parseISO } from "date-fns";

export default function (dateString) {
  let date = parseISO(dateString.substring(0, 10), "MMMM do");
  let time = formatDistanceToNowStrict(date, {
    unit: "day",
    addSuffix: true,
  });

  if (isToday(date)) {
    return "Today";
  }
  return time;
}
