export default function poundsToKilos(pounds: number) {
  let kilos = pounds * 0.45359237;

  return parseFloat(kilos.toFixed(0)); // rounding to 0 decimal places
}
