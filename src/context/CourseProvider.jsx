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

const MALLA_NUEVA = "Malla Nueva";
const MALLA_ANTIGUA = "Malla Antigua";
const MALLA_TITLES = [MALLA_NUEVA, MALLA_ANTIGUA];

const stored = readJson("stored", MALLA_NUEVA);
const storedShowPrerequisites = readJson("showPrerequisites", true);
const storedInternadoOrderByMalla = readJson("internadoOrderByMalla", {});
const SWAP_HIGHLIGHT_MS = 1400;

const createEmptyProgress = () => ({
  finishedCourses: [],
  totalCredits: 0,
});

const normalizeProgress = progress => ({
  finishedCourses: Array.isArray(progress?.finishedCourses)
    ? [...progress.finishedCourses]
    : [],
  totalCredits:
    typeof progress?.totalCredits === "number" ? progress.totalCredits : 0,
});

const readInitialProgress = () => {
  const byMalla = readJson("progressByMalla", null);
  const legacyCourses = readJson("finishedCourses", []);
  const legacyCredits = readJson("credits", 0);
  const hasLegacy =
    (Array.isArray(legacyCourses) && legacyCourses.length > 0) ||
    legacyCredits > 0;

  const initial = {};
  MALLA_TITLES.forEach(mallaTitle => {
    if (byMalla?.[mallaTitle]) {
      initial[mallaTitle] = normalizeProgress(byMalla[mallaTitle]);
      return;
    }
    if (!byMalla && hasLegacy && mallaTitle === stored) {
      initial[mallaTitle] = {
        finishedCourses: [...legacyCourses],
        totalCredits: legacyCredits,
      };
      return;
    }
    initial[mallaTitle] = createEmptyProgress();
  });

  return initial;
};

const storedProgressByMalla = readInitialProgress();

const EMPTY_RELATION_IDS = {
  relatedCourseIds: new Set(),
  prereqIds: new Set(),
  unlockIds: new Set(),
};

export const CourseProvider = ({ children }) => {
  const [progressByMalla, setProgressByMalla] = useState(storedProgressByMalla);
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
  const [editBaselineOrder, setEditBaselineOrder] = useState(null);
  const [draggingInternadoId, setDraggingInternadoId] = useState(null);
  const [dragOverInternadoId, setDragOverInternadoId] = useState(null);
  const [recentlySwappedIds, setRecentlySwappedIds] = useState(new Set());
  const [toastMessage, setToastMessage] = useState(null);
  const swapHighlightTimer = useRef(null);
  const toastTimer = useRef(null);

  const baseCourses = title === MALLA_NUEVA ? ramos2023 : ramos2016;

  const currentProgress = progressByMalla[title] || createEmptyProgress();
  const finishedCourses = currentProgress.finishedCourses;
  const totalCredits = currentProgress.totalCredits;

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
    if (!editMode || !draftInternadoOrder || !editBaselineOrder) {
      return false;
    }
    if (draftInternadoOrder.length !== editBaselineOrder.length) {
      return true;
    }
    return draftInternadoOrder.some(
      (id, index) => id !== editBaselineOrder[index]
    );
  }, [editMode, draftInternadoOrder, editBaselineOrder]);

  useEffect(() => {
    localStorage.setItem("progressByMalla", JSON.stringify(progressByMalla));
    localStorage.removeItem("finishedCourses");
    localStorage.removeItem("credits");
  }, [progressByMalla]);

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
    setEditBaselineOrder(null);
    setDraggingInternadoId(null);
    setDragOverInternadoId(null);
    setRecentlySwappedIds(new Set());
  }, [title]);

  useEffect(
    () => () => {
      if (swapHighlightTimer.current) {
        clearTimeout(swapHighlightTimer.current);
      }
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
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

  const updateProgress = useCallback(
    updater => {
      setProgressByMalla(prev => {
        const current = normalizeProgress(prev[title]);
        return {
          ...prev,
          [title]: updater(current),
        };
      });
    },
    [title]
  );

  const showToast = useCallback(message => {
    setToastMessage(message);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  const clearToast = useCallback(() => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    setToastMessage(null);
  }, []);

  const handleReset = useCallback(() => {
    updateProgress(() => createEmptyProgress());
  }, [updateProgress]);

  const resetMallaToDefault = useCallback(() => {
    const defaultOrder = getDefaultInternadoOrder(baseCourses);
    setInternadoOrderByMalla(prev => ({
      ...prev,
      [title]: defaultOrder,
    }));
    setDraftInternadoOrder(defaultOrder);
    setEditBaselineOrder(defaultOrder);
    setDraggingInternadoId(null);
    setDragOverInternadoId(null);
    setRecentlySwappedIds(new Set());
    setHighlightedCourseId(null);
    showToast("Se restableció el orden por defecto");
  }, [title, baseCourses, showToast]);

  const handleClick = useCallback(
    course => {
      updateProgress(current => {
        const courseCredits = course.cr || 0;

        if (current.finishedCourses.includes(course.id)) {
          return {
            finishedCourses: current.finishedCourses.filter(
              id => id !== course.id
            ),
            totalCredits: Math.max(0, current.totalCredits - courseCredits),
          };
        }

        return {
          finishedCourses: [...current.finishedCourses, course.id],
          totalCredits: current.totalCredits + courseCredits,
        };
      });
    },
    [updateProgress]
  );

  const toggleShowPrerequisites = useCallback(() => {
    setShowPrerequisites(prev => !prev);
  }, []);

  const enterEditMode = useCallback(() => {
    setDraftInternadoOrder(savedInternadoOrder);
    setEditBaselineOrder(savedInternadoOrder);
    setEditMode(true);
    setHighlightedCourseId(null);
  }, [savedInternadoOrder]);

  const cancelEditMode = useCallback(() => {
    const hadChanges =
      draftInternadoOrder &&
      editBaselineOrder &&
      (draftInternadoOrder.length !== editBaselineOrder.length ||
        draftInternadoOrder.some(
          (id, index) => id !== editBaselineOrder[index]
        ));

    if (editBaselineOrder) {
      setInternadoOrderByMalla(prev => ({
        ...prev,
        [title]: editBaselineOrder,
      }));
    }
    setDraftInternadoOrder(null);
    setEditBaselineOrder(null);
    setDraggingInternadoId(null);
    setDragOverInternadoId(null);
    setEditMode(false);
    if (hadChanges) {
      showToast("Se descartaron los cambios");
    }
  }, [draftInternadoOrder, editBaselineOrder, title, showToast]);

  const saveEditMode = useCallback(() => {
    const orderToSave = draftInternadoOrder || savedInternadoOrder;
    setInternadoOrderByMalla(prev => ({
      ...prev,
      [title]: orderToSave,
    }));
    setDraftInternadoOrder(null);
    setEditBaselineOrder(null);
    setDraggingInternadoId(null);
    setDragOverInternadoId(null);
    setEditMode(false);
    showToast("Se guardaron los cambios");
  }, [draftInternadoOrder, savedInternadoOrder, title, showToast]);

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
        const next = swapInternados(current, fromId, toId);
        setInternadoOrderByMalla(orders => ({
          ...orders,
          [title]: next,
        }));
        return next;
      });
      setRecentlySwappedIds(new Set([fromId, toId]));
      if (swapHighlightTimer.current) {
        clearTimeout(swapHighlightTimer.current);
      }
      swapHighlightTimer.current = setTimeout(() => {
        setRecentlySwappedIds(new Set());
      }, SWAP_HIGHLIGHT_MS);
    },
    [editMode, savedInternadoOrder, title]
  );

  const value = useMemo(
    () => ({
      title,
      setTitle,
      handleReset,
      resetMallaToDefault,
      totalCredits,
      finishedCourses,
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
      toastMessage,
      clearToast,
    }),
    [
      title,
      handleReset,
      resetMallaToDefault,
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
      toastMessage,
      clearToast,
    ]
  );

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};
