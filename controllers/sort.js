const sortList = (array, sort_by, order_by) => {
  if (sort_by) {
    return array.sort((a, b) => {
      const valueA = a[sort_by];
      const valueB = b[sort_by];

      if (typeof valueA === "number") {
        if (order_by === "desc") {
          return valueB - valueA;
        } else {
          return valueA - valueB;
        }
      } else if (sort_by === "updated_at" || sort_by === "created_at") {
        if (order_by === "desc") {
          return valueB.getTime() - valueA.getTime();
        } else {
          return valueA.getTime() - valueB.getTime();
        }
      } else {
        if (order_by === "desc") {
          return valueB.localeCompare(valueA);
        } else {
          return valueA.localeCompare(valueB);
        }
      }
    });
  } else {
    return array;
  }
};

module.exports = { sortList };
