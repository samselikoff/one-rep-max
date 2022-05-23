export default function estimatedMax(set) {
  // Jim Wendler formula
  // return +set.weight * +set.reps * 0.0333 + +set.weight;

  // Brzycki formula
  return set.weight / (1.0278 - 0.0278 * set.reps);
}
