
 /**
   * Calculates the median values for an array of numbers
   *
   * @param {array} array of numbers
   * @return {number} the median value
   */
const median = (array) => {
  array.sort((a, b) => b - a);
  const length = array.length;
  if (length % 2 == 0) {
    return (array[length / 2] + array[(length / 2) - 1]) / 2;
  }
  return array[Math.floor(length / 2)];
}


