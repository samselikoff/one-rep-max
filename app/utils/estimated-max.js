export default function estimatedMax(set) {
  if (+set.reps <= 0) {
    return 0;
  }

  // Jim Wendler formula
  // return +set.weight * +set.reps * 0.0333 + +set.weight;

  // Brzycki formula
  // return set.weight / (1.0278 - 0.0278 * set.reps);

  //  Wathan formula
  let reps = +set.reps > 50 ? 50 : +set.reps;

  return +set.weight / wathanPercentages[reps - 1];
}

export function repsFromEstimatedMax(max, weight) {
  // Jim Wendler formula
  // return (max - +weight) / (+weight * 0.0333);

  // Wathan formula
  let currentPercentage = weight / max;
  let firstPercentageLower = wathanPercentages.find(
    (percentage) => weight / max > percentage
  );
  let x;
  if (!firstPercentageLower) {
    x = Infinity; // can't hit this max at this weight!
  } else if (currentPercentage === firstPercentageLower) {
    x = wathanPercentages.indexOf(firstPercentageLower) + 2;
  } else {
    x = wathanPercentages.indexOf(firstPercentageLower) + 1;
  }
  return x;
}

let wathanPercentages = [
  100.0, 95.2381, 91.9208, 89.2767, 87.0451, 85.0995, 83.3671, 81.8015, 80.3707,
  79.0516, 77.8269, 76.6834, 75.6104, 74.5995, 73.6437, 72.7371, 71.8748,
  71.0526, 70.2671, 69.5149, 68.7935, 68.1004, 67.4336, 66.7911, 66.1712,
  65.5726, 64.9937, 64.4334, 63.8906, 63.3642, 62.8534, 62.3572, 61.8749,
  61.4058, 60.9492, 60.5044, 60.071, 59.6484, 59.2361, 58.8336, 58.4405,
  58.0564, 57.681, 57.3138, 56.9546, 56.603, 56.2587, 55.9215, 55.5911, 55.2672,
].map((v) => v / 100);
