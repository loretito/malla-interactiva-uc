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
import {
  applyCourseOverrides,
  areCourseOverridesEqual,
  cloneCourseOverrides,
  isEditableCourse,
  normalizeCourseOverrides,
} from "../utils/editable-courses";
import {
  areTypeColorsEqual,
  cloneTypeColors,
  DEFAULT_TYPE_COLORS,
  getTypesInCourses,
  normalizeTypeColors,
} from "../utils/course-type-colors";

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
const storedCourseOverridesByMalla = readJson("courseOverridesByMalla", {});
const storedShowTypeColors = readJson("showTypeColors", false);
const storedTypeColorsByMalla = readJson("typeColorsByMalla", {});
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
  const [showTypeColors, setShowTypeColors] = useState(storedShowTypeColors);
  const [editMode, setEditMode] = useState(false);
  const [internadoOrderByMalla, setInternadoOrderByMalla] = useState(
    storedInternadoOrderByMalla
  );
  const [courseOverridesByMalla, setCourseOverridesByMalla] = useState(
    storedCourseOverridesByMalla
  );
  const [typeColorsByMalla, setTypeColorsByMalla] = useState(
    storedTypeColorsByMalla
  );
  const [draftInternadoOrder, setDraftInternadoOrder] = useState(null);
  const [editBaselineOrder, setEditBaselineOrder] = useState(null);
  const [draftCourseOverrides, setDraftCourseOverrides] = useState(null);
  const [editBaselineOverrides, setEditBaselineOverrides] = useState(null);
  const [draftTypeColors, setDraftTypeColors] = useState(null);
  const [editBaselineTypeColors, setEditBaselineTypeColors] = useState(null);
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

  const savedCourseOverrides = useMemo(
    () => normalizeCourseOverrides(courseOverridesByMalla[title]),
    [courseOverridesByMalla, title]
  );

  const savedTypeColors = useMemo(
    () => normalizeTypeColors(typeColorsByMalla[title]),
    [typeColorsByMalla, title]
  );

  const activeInternadoOrder = editMode
    ? draftInternadoOrder || savedInternadoOrder
    : savedInternadoOrder;

  const activeCourseOverrides = editMode
    ? draftCourseOverrides || savedCourseOverrides
    : savedCourseOverrides;

  const activeTypeColors = editMode
    ? draftTypeColors || savedTypeColors
    : savedTypeColors;

  const courseTypesInMalla = useMemo(
    () => getTypesInCourses(baseCourses),
    [baseCourses]
  );

  const courses = useMemo(
    () =>
      applyCourseOverrides(
        applyInternadoOrder(baseCourses, activeInternadoOrder),
        activeCourseOverrides
      ),
    [baseCourses, activeInternadoOrder, activeCourseOverrides]
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
    if (!editMode) {
      return false;
    }

    const orderChanged =
      draftInternadoOrder &&
      editBaselineOrder &&
      (draftInternadoOrder.length !== editBaselineOrder.length ||
        draftInternadoOrder.some(
          (id, index) => id !== editBaselineOrder[index]
        ));

    const overridesChanged =
      draftCourseOverrides != null &&
      editBaselineOverrides != null &&
      !areCourseOverridesEqual(draftCourseOverrides, editBaselineOverrides);

    const typeColorsChanged =
      draftTypeColors != null &&
      editBaselineTypeColors != null &&
      !areTypeColorsEqual(draftTypeColors, editBaselineTypeColors);

    return Boolean(orderChanged || overridesChanged || typeColorsChanged);
  }, [
    editMode,
    draftInternadoOrder,
    editBaselineOrder,
    draftCourseOverrides,
    editBaselineOverrides,
    draftTypeColors,
    editBaselineTypeColors,
  ]);

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
    localStorage.setItem(
      "courseOverridesByMalla",
      JSON.stringify(courseOverridesByMalla)
    );
  }, [courseOverridesByMalla]);

  useEffect(() => {
    localStorage.setItem("showTypeColors", JSON.stringify(showTypeColors));
  }, [showTypeColors]);

  useEffect(() => {
    localStorage.setItem(
      "typeColorsByMalla",
      JSON.stringify(typeColorsByMalla)
    );
  }, [typeColorsByMalla]);

  useEffect(() => {
    setHighlightedCourseId(null);
    setEditMode(false);
    setDraftInternadoOrder(null);
    setEditBaselineOrder(null);
    setDraftCourseOverrides(null);
    setEditBaselineOverrides(null);
    setDraftTypeColors(null);
    setEditBaselineTypeColors(null);
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
    const emptyOverrides = {};
    const defaultColors = { ...DEFAULT_TYPE_COLORS };
    setInternadoOrderByMalla(prev => ({
      ...prev,
      [title]: defaultOrder,
    }));
    setCourseOverridesByMalla(prev => ({
      ...prev,
      [title]: emptyOverrides,
    }));
    setTypeColorsByMalla(prev => ({
      ...prev,
      [title]: defaultColors,
    }));
    setDraftInternadoOrder(defaultOrder);
    setEditBaselineOrder(defaultOrder);
    setDraftCourseOverrides(emptyOverrides);
    setEditBaselineOverrides(emptyOverrides);
    setDraftTypeColors(defaultColors);
    setEditBaselineTypeColors(defaultColors);
    setDraggingInternadoId(null);
    setDragOverInternadoId(null);
    setRecentlySwappedIds(new Set());
    setHighlightedCourseId(null);
    showToast("Se restablecieron los cambios editables");
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

  const toggleShowTypeColors = useCallback(() => {
    setShowTypeColors(prev => !prev);
  }, []);

  const enterEditMode = useCallback(() => {
    const overridesSnapshot = cloneCourseOverrides(savedCourseOverrides);
    const colorsSnapshot = cloneTypeColors(savedTypeColors);
    setDraftInternadoOrder(savedInternadoOrder);
    setEditBaselineOrder(savedInternadoOrder);
    setDraftCourseOverrides(overridesSnapshot);
    setEditBaselineOverrides(cloneCourseOverrides(overridesSnapshot));
    setDraftTypeColors(colorsSnapshot);
    setEditBaselineTypeColors(cloneTypeColors(colorsSnapshot));
    setEditMode(true);
    setHighlightedCourseId(null);
  }, [savedInternadoOrder, savedCourseOverrides, savedTypeColors]);

  const cancelEditMode = useCallback(() => {
    const orderChanged =
      draftInternadoOrder &&
      editBaselineOrder &&
      (draftInternadoOrder.length !== editBaselineOrder.length ||
        draftInternadoOrder.some(
          (id, index) => id !== editBaselineOrder[index]
        ));
    const overridesChanged =
      draftCourseOverrides != null &&
      editBaselineOverrides != null &&
      !areCourseOverridesEqual(draftCourseOverrides, editBaselineOverrides);
    const typeColorsChanged =
      draftTypeColors != null &&
      editBaselineTypeColors != null &&
      !areTypeColorsEqual(draftTypeColors, editBaselineTypeColors);
    const hadChanges = Boolean(
      orderChanged || overridesChanged || typeColorsChanged
    );

    if (editBaselineOrder) {
      setInternadoOrderByMalla(prev => ({
        ...prev,
        [title]: editBaselineOrder,
      }));
    }
    setDraftInternadoOrder(null);
    setEditBaselineOrder(null);
    setDraftCourseOverrides(null);
    setEditBaselineOverrides(null);
    setDraftTypeColors(null);
    setEditBaselineTypeColors(null);
    setDraggingInternadoId(null);
    setDragOverInternadoId(null);
    setEditMode(false);
    if (hadChanges) {
      showToast("Se descartaron los cambios");
    }
  }, [
    draftInternadoOrder,
    editBaselineOrder,
    draftCourseOverrides,
    editBaselineOverrides,
    draftTypeColors,
    editBaselineTypeColors,
    title,
    showToast,
  ]);

  const saveEditMode = useCallback(() => {
    const orderToSave = draftInternadoOrder || savedInternadoOrder;
    const overridesToSave = normalizeCourseOverrides(
      draftCourseOverrides || savedCourseOverrides
    );
    const colorsToSave = normalizeTypeColors(
      draftTypeColors || savedTypeColors
    );
    setInternadoOrderByMalla(prev => ({
      ...prev,
      [title]: orderToSave,
    }));
    setCourseOverridesByMalla(prev => ({
      ...prev,
      [title]: overridesToSave,
    }));
    setTypeColorsByMalla(prev => ({
      ...prev,
      [title]: colorsToSave,
    }));
    setDraftInternadoOrder(null);
    setEditBaselineOrder(null);
    setDraftCourseOverrides(null);
    setEditBaselineOverrides(null);
    setDraftTypeColors(null);
    setEditBaselineTypeColors(null);
    setDraggingInternadoId(null);
    setDragOverInternadoId(null);
    setEditMode(false);
    showToast("Se guardaron los cambios");
  }, [
    draftInternadoOrder,
    savedInternadoOrder,
    draftCourseOverrides,
    savedCourseOverrides,
    draftTypeColors,
    savedTypeColors,
    title,
    showToast,
  ]);

  const updateCourseOverride = useCallback(
    (courseId, override) => {
      if (!editMode) {
        return;
      }
      setDraftCourseOverrides(prev => {
        const current = normalizeCourseOverrides(prev || savedCourseOverrides);
        return {
          ...current,
          [String(courseId)]: {
            code: typeof override.code === "string" ? override.code.trim() : "",
            course:
              typeof override.course === "string" ? override.course.trim() : "",
          },
        };
      });
    },
    [editMode, savedCourseOverrides]
  );

  const updateTypeColor = useCallback(
    (typeKey, hex) => {
      if (!editMode) {
        return;
      }
      setShowTypeColors(true);
      setDraftTypeColors(prev => ({
        ...normalizeTypeColors(prev || savedTypeColors),
        [typeKey]: hex,
      }));
    },
    [editMode, savedTypeColors]
  );

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
      showTypeColors,
      toggleShowTypeColors,
      activeTypeColors,
      courseTypesInMalla,
      updateTypeColor,
      editMode,
      toggleEditMode,
      enterEditMode,
      cancelEditMode,
      saveEditMode,
      hasUnsavedInternadoChanges,
      reorderInternado,
      updateCourseOverride,
      draggingInternadoId,
      setDraggingInternadoId,
      dragOverInternadoId,
      setDragOverInternadoId,
      recentlySwappedIds,
      isInternado,
      isEditableCourse,
      toastMessage,
      showToast,
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
      showTypeColors,
      toggleShowTypeColors,
      activeTypeColors,
      courseTypesInMalla,
      updateTypeColor,
      editMode,
      toggleEditMode,
      enterEditMode,
      cancelEditMode,
      saveEditMode,
      hasUnsavedInternadoChanges,
      reorderInternado,
      updateCourseOverride,
      draggingInternadoId,
      dragOverInternadoId,
      recentlySwappedIds,
      toastMessage,
      showToast,
      clearToast,
    ]
  );

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};
