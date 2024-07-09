export default function poundsToKilos(pounds: number) {
  let kilos = pounds * 0.45359237;

  return parseFloat(kilos.toFixed(2)); // rounding to 2 decimal places
}
