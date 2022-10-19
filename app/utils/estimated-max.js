export default function estimatedMax(set) {
  // Jim Wendler formula
  // return +set.weight * +set.reps * 0.0333 + +set.weight;

  // Brzycki formula
  // return set.weight / (1.0278 - 0.0278 * set.reps);

  // Wathan formula
  return (
    +set.weight +
    [...Array(set.reps - 1).keys()].reduce((prev, i) => {
      return prev + +set.weight / (20 * ((i + 1) ^ 0.35));
    }, 0)
  );
}
