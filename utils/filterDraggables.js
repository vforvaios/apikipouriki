const majorCategories = {
  1: 'Υπάλληλοι',
  2: 'Tasks',
};

const filterDraggables = (data, category, searchText, active) => {
  const obj = [...data?.[majorCategories[category]].content].filter((o) => {
    if (Number(o.isActive) === Number(active)) {
      return o.itemName.toLowerCase().includes(searchText.toLowerCase());
    }
    // κρατάω όλα τα άλλα tasks (που δεν έχουν το active param)
    return true;
  });

  const categoryNotBeingFiltered = Object.keys(majorCategories).filter(
    (cat) => cat !== category,
  );

  return {
    [majorCategories[category]]: {
      ...data?.[majorCategories[category]],
      content: obj,
    },
    [majorCategories[categoryNotBeingFiltered]]:
      data?.[majorCategories[categoryNotBeingFiltered]], // χωρίς αλλαγές
  };
};

module.exports = filterDraggables;
