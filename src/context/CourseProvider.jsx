import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CourseContext } from "./CourseContext";
import { ramos2016, ramos2023 } from "../utils";
import {
  applyInternadoOrder,
  getDefaultInternadoOrder,
  isInternado,
  normalizeInternadoOrder,
  swapInternados,
} from "../utils/internados";

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
const storedInternadoOrderByMalla = readJson("internadoOrderByMalla", {});
const SWAP_HIGHLIGHT_MS = 1400;

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
  const [editMode, setEditMode] = useState(false);
  const [internadoOrderByMalla, setInternadoOrderByMalla] = useState(
    storedInternadoOrderByMalla
  );
  const [draftInternadoOrder, setDraftInternadoOrder] = useState(null);
  const [draggingInternadoId, setDraggingInternadoId] = useState(null);
  const [dragOverInternadoId, setDragOverInternadoId] = useState(null);
  const [recentlySwappedIds, setRecentlySwappedIds] = useState(new Set());
  const swapHighlightTimer = useRef(null);

  const baseCourses = title === "Malla Nueva" ? ramos2023 : ramos2016;

  const savedInternadoOrder = useMemo(() => {
    const storedOrder = internadoOrderByMalla[title];
    return normalizeInternadoOrder(baseCourses, storedOrder || []);
  }, [baseCourses, internadoOrderByMalla, title]);

  const activeInternadoOrder = editMode
    ? draftInternadoOrder || savedInternadoOrder
    : savedInternadoOrder;

  const courses = useMemo(
    () => applyInternadoOrder(baseCourses, activeInternadoOrder),
    [baseCourses, activeInternadoOrder]
  );

  const coursesById = useMemo(() => {
    const map = new Map();
    courses.forEach(course => map.set(course.id, course));
    return map;
  }, [courses]);

  const coursesBySemesterAndYear = useMemo(() => {
    const grouped = courses.reduce((acc, course) => {
      const { year, semester } = course;
      if (!acc[year]) {
        acc[year] = {};
      }
      if (!acc[year][semester]) {
        acc[year][semester] = [];
      }
      acc[year][semester].push(course);
      return acc;
    }, {});

    const orderIndex = new Map(
      activeInternadoOrder.map((id, index) => [id, index])
    );

    Object.values(grouped).forEach(semesters => {
      Object.values(semesters).forEach(semesterCourses => {
        semesterCourses.sort((a, b) => {
          if (!isInternado(a) || !isInternado(b)) {
            return 0;
          }
          return (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0);
        });
      });
    });

    return grouped;
  }, [courses, activeInternadoOrder]);

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

  const hasUnsavedInternadoChanges = useMemo(() => {
    if (!editMode || !draftInternadoOrder) {
      return false;
    }
    if (draftInternadoOrder.length !== savedInternadoOrder.length) {
      return true;
    }
    return draftInternadoOrder.some(
      (id, index) => id !== savedInternadoOrder[index]
    );
  }, [editMode, draftInternadoOrder, savedInternadoOrder]);

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
    localStorage.setItem(
      "internadoOrderByMalla",
      JSON.stringify(internadoOrderByMalla)
    );
  }, [internadoOrderByMalla]);

  useEffect(() => {
    setHighlightedCourseId(null);
    setEditMode(false);
    setDraftInternadoOrder(null);
    setDraggingInternadoId(null);
    setDragOverInternadoId(null);
    setRecentlySwappedIds(new Set());
  }, [title]);

  useEffect(
    () => () => {
      if (swapHighlightTimer.current) {
        clearTimeout(swapHighlightTimer.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!showPrerequisites) {
      setHighlightedCourseId(null);
    }
  }, [showPrerequisites]);

  useEffect(() => {
    setInternadoOrderByMalla(prev => {
      if (prev[title]?.length) {
        return prev;
      }
      return {
        ...prev,
        [title]: getDefaultInternadoOrder(baseCourses),
      };
    });
  }, [title, baseCourses]);

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

  const enterEditMode = useCallback(() => {
    setDraftInternadoOrder(savedInternadoOrder);
    setEditMode(true);
    setHighlightedCourseId(null);
  }, [savedInternadoOrder]);

  const cancelEditMode = useCallback(() => {
    setDraftInternadoOrder(null);
    setDraggingInternadoId(null);
    setDragOverInternadoId(null);
    setEditMode(false);
  }, []);

  const saveEditMode = useCallback(() => {
    const orderToSave = draftInternadoOrder || savedInternadoOrder;
    setInternadoOrderByMalla(prev => ({
      ...prev,
      [title]: orderToSave,
    }));
    setDraftInternadoOrder(null);
    setDraggingInternadoId(null);
    setDragOverInternadoId(null);
    setEditMode(false);
  }, [draftInternadoOrder, savedInternadoOrder, title]);

  const toggleEditMode = useCallback(() => {
    if (editMode) {
      cancelEditMode();
      return;
    }
    enterEditMode();
  }, [editMode, cancelEditMode, enterEditMode]);

  const reorderInternado = useCallback(
    (fromId, toId) => {
      if (!editMode) {
        return;
      }
      setDraftInternadoOrder(prev => {
        const current = prev || savedInternadoOrder;
        return swapInternados(current, fromId, toId);
      });
      setRecentlySwappedIds(new Set([fromId, toId]));
      if (swapHighlightTimer.current) {
        clearTimeout(swapHighlightTimer.current);
      }
      swapHighlightTimer.current = setTimeout(() => {
        setRecentlySwappedIds(new Set());
      }, SWAP_HIGHLIGHT_MS);
    },
    [editMode, savedInternadoOrder]
  );

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
      toggleEditMode,
      enterEditMode,
      cancelEditMode,
      saveEditMode,
      hasUnsavedInternadoChanges,
      reorderInternado,
      draggingInternadoId,
      setDraggingInternadoId,
      dragOverInternadoId,
      setDragOverInternadoId,
      recentlySwappedIds,
      isInternado,
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
      toggleEditMode,
      enterEditMode,
      cancelEditMode,
      saveEditMode,
      hasUnsavedInternadoChanges,
      reorderInternado,
      draggingInternadoId,
      dragOverInternadoId,
      recentlySwappedIds,
    ]
  );

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};
