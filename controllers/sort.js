const sortList = (array, sort_by, order_by) => {
  if (sort_by) {
    return array.sort((a, b) => {
      const valueA = a[sort_by];
      const valueB = b[sort_by];
      console.log(valueA, valueB);
      if (order_by === "desc") {
        return valueB.localeCompare(valueA);
      } else {
        return valueA.localeCompare(valueB);
      }
    });
  } else {
    return array;
  }
};

module.exports = { sortList };
