const SEMESTER_RANK = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
};

export const isInternado = course =>
  typeof course?.course === "string" &&
  course.course.toLowerCase().includes("internado");

const compareInternadoSlots = (a, b) => {
  if (a.year !== b.year) {
    return a.year - b.year;
  }

  const semesterDiff =
    (SEMESTER_RANK[a.semester] || 0) - (SEMESTER_RANK[b.semester] || 0);
  if (semesterDiff !== 0) {
    return semesterDiff;
  }

  return a.id - b.id;
};

export const getDefaultInternadoOrder = courses =>
  courses.filter(isInternado).sort(compareInternadoSlots).map(course => course.id);

export const normalizeInternadoOrder = (courses, preferredOrder = []) => {
  const defaultOrder = getDefaultInternadoOrder(courses);
  if (defaultOrder.length === 0) {
    return [];
  }

  const defaultSet = new Set(defaultOrder);
  const validPreferred = preferredOrder.filter(id => defaultSet.has(id));
  const missing = defaultOrder.filter(id => !validPreferred.includes(id));
  return [...validPreferred, ...missing];
};

export const applyInternadoOrder = (courses, preferredOrder) => {
  const internados = courses.filter(isInternado);
  if (internados.length === 0) {
    return courses;
  }

  const slots = [...internados]
    .sort(compareInternadoSlots)
    .map(course => ({ year: course.year, semester: course.semester }));
  const order = normalizeInternadoOrder(courses, preferredOrder);
  const byId = new Map(internados.map(course => [course.id, course]));
  const reassigned = new Map();

  order.forEach((id, index) => {
    const course = byId.get(id);
    const slot = slots[index];
    if (!course || !slot) {
      return;
    }
    reassigned.set(id, {
      ...course,
      year: slot.year,
      semester: slot.semester,
    });
  });

  return courses.map(course =>
    isInternado(course) ? reassigned.get(course.id) || course : course
  );
};

export const moveInternadoInOrder = (order, courseId, direction) => {
  const index = order.indexOf(courseId);
  if (index < 0) {
    return order;
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= order.length) {
    return order;
  }

  const nextOrder = [...order];
  const current = nextOrder[index];
  nextOrder[index] = nextOrder[targetIndex];
  nextOrder[targetIndex] = current;
  return nextOrder;
};

export const moveInternadoToTarget = (order, fromId, toId) => {
  if (fromId === toId) {
    return order;
  }

  const fromIndex = order.indexOf(fromId);
  const toIndex = order.indexOf(toId);
  if (fromIndex < 0 || toIndex < 0) {
    return order;
  }

  const nextOrder = [...order];
  nextOrder.splice(fromIndex, 1);
  nextOrder.splice(toIndex, 0, fromId);
  return nextOrder;
};
