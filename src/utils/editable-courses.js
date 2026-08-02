import { isInternado } from "./internados";

const EDITABLE_COURSE_NAMES = new Set([
  "electivo en otra disciplina",
  "optativo de profundización",
  "optativo",
  "formación general",
]);

export const isEditableCourse = course => {
  if (!course?.course || isInternado(course)) {
    return false;
  }
  return EDITABLE_COURSE_NAMES.has(course.course.toLowerCase().trim());
};

export const normalizeCourseOverrides = overrides => {
  if (!overrides || typeof overrides !== "object") {
    return {};
  }

  return Object.entries(overrides).reduce((acc, [id, value]) => {
    if (!value || typeof value !== "object") {
      return acc;
    }
    acc[String(id)] = {
      code: typeof value.code === "string" ? value.code.trim() : "",
      course: typeof value.course === "string" ? value.course.trim() : "",
    };
    return acc;
  }, {});
};

export const cloneCourseOverrides = overrides =>
  normalizeCourseOverrides(overrides);

export const areCourseOverridesEqual = (a, b) => {
  const left = normalizeCourseOverrides(a);
  const right = normalizeCourseOverrides(b);
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every(key => {
    const leftValue = left[key];
    const rightValue = right[key];
    return (
      leftValue &&
      rightValue &&
      leftValue.code === rightValue.code &&
      leftValue.course === rightValue.course
    );
  });
};

export const applyCourseOverrides = (courses, overrides) => {
  const normalized = normalizeCourseOverrides(overrides);

  return courses.map(course => {
    const labelEditable = isEditableCourse(course);
    const override = normalized[String(course.id)];

    if (!override) {
      return labelEditable
        ? { ...course, labelEditable: true }
        : course;
    }

    return {
      ...course,
      code: override.code || course.code || "",
      course: override.course || course.course,
      labelEditable,
    };
  });
};
