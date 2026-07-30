import { useCallback, useEffect, useMemo, useState } from "react";
import { CourseContext } from "./CourseContext";
import { ramos2016, ramos2023 } from "../utils";

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const storedFinishedCourses = readJson("finishedCourses", []);
const credits = readJson("credits", 0);
const stored = readJson("stored", "Malla Nueva");
const storedShowPrerequisites = readJson("showPrerequisites", true);
const storedEditMode = readJson("editMode", false);

const EMPTY_RELATION_IDS = {
  relatedCourseIds: new Set(),
  prereqIds: new Set(),
  unlockIds: new Set(),
};

export const CourseProvider = ({ children }) => {
  const [finishedCourses, setFinishedCourses] = useState(storedFinishedCourses);
  const [totalCredits, setTotalCredits] = useState(credits);
  const [title, setTitle] = useState(stored);
  const [highlightedCourseId, setHighlightedCourseId] = useState(null);
  const [showPrerequisites, setShowPrerequisites] = useState(
    storedShowPrerequisites
  );
  const [editMode, setEditMode] = useState(storedEditMode);

  const courses = title === "Malla Nueva" ? ramos2023 : ramos2016;

  const coursesById = useMemo(() => {
    const map = new Map();
    courses.forEach(course => map.set(course.id, course));
    return map;
  }, [courses]);

  const coursesBySemesterAndYear = useMemo(
    () =>
      courses.reduce((acc, course) => {
        const { year, semester } = course;
        if (!acc[year]) {
          acc[year] = {};
        }
        if (!acc[year][semester]) {
          acc[year][semester] = [];
        }
        acc[year][semester].push(course);
        return acc;
      }, {}),
    [courses]
  );

  const dependentsById = useMemo(() => {
    const map = {};
    courses.forEach(course => {
      course.req.forEach(req => {
        if (!map[req.id]) {
          map[req.id] = [];
        }
        map[req.id].push(course.id);
      });
    });
    return map;
  }, [courses]);

  const { relatedCourseIds, prereqIds, unlockIds } = useMemo(() => {
    if (!showPrerequisites || highlightedCourseId == null) {
      return EMPTY_RELATION_IDS;
    }

    const highlighted = coursesById.get(highlightedCourseId);
    if (!highlighted) {
      return EMPTY_RELATION_IDS;
    }

    const nextPrereqIds = new Set(highlighted.req.map(req => req.id));
    const nextUnlockIds = new Set(dependentsById[highlightedCourseId] || []);
    const nextRelatedCourseIds = new Set([...nextPrereqIds, ...nextUnlockIds]);

    return {
      relatedCourseIds: nextRelatedCourseIds,
      prereqIds: nextPrereqIds,
      unlockIds: nextUnlockIds,
    };
  }, [highlightedCourseId, coursesById, dependentsById, showPrerequisites]);

  useEffect(() => {
    localStorage.setItem("finishedCourses", JSON.stringify(finishedCourses));
    localStorage.setItem("credits", JSON.stringify(totalCredits));
  }, [finishedCourses, totalCredits]);

  useEffect(() => {
    localStorage.setItem("stored", JSON.stringify(title));
  }, [title]);

  useEffect(() => {
    localStorage.setItem(
      "showPrerequisites",
      JSON.stringify(showPrerequisites)
    );
  }, [showPrerequisites]);

  useEffect(() => {
    localStorage.setItem("editMode", JSON.stringify(editMode));
  }, [editMode]);

  useEffect(() => {
    setHighlightedCourseId(null);
  }, [title]);

  useEffect(() => {
    if (!showPrerequisites) {
      setHighlightedCourseId(null);
    }
  }, [showPrerequisites]);

  const handleReset = useCallback(() => {
    setTotalCredits(0);
    setFinishedCourses([]);
  }, []);

  const handleClick = useCallback(course => {
    setFinishedCourses(prevFinishedCourses => {
      const isFinished = prevFinishedCourses.includes(course.id);

      if (!isFinished) {
        if (course.cr) {
          setTotalCredits(state => state + course.cr);
        }
        return [...prevFinishedCourses, course.id];
      }

      if (course.cr) {
        setTotalCredits(state => state - course.cr);
      }
      return prevFinishedCourses.filter(id => id !== course.id);
    });
  }, []);

  const toggleShowPrerequisites = useCallback(() => {
    setShowPrerequisites(prev => !prev);
  }, []);

  const value = useMemo(
    () => ({
      title,
      setTitle,
      handleReset,
      totalCredits,
      setTotalCredits,
      finishedCourses,
      setFinishedCourses,
      coursesBySemesterAndYear,
      handleClick,
      courses,
      coursesById,
      highlightedCourseId,
      setHighlightedCourseId,
      dependentsById,
      relatedCourseIds,
      prereqIds,
      unlockIds,
      showPrerequisites,
      setShowPrerequisites,
      toggleShowPrerequisites,
      editMode,
      setEditMode,
    }),
    [
      title,
      handleReset,
      totalCredits,
      finishedCourses,
      coursesBySemesterAndYear,
      handleClick,
      courses,
      coursesById,
      highlightedCourseId,
      dependentsById,
      relatedCourseIds,
      prereqIds,
      unlockIds,
      showPrerequisites,
      toggleShowPrerequisites,
      editMode,
    ]
  );

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};
