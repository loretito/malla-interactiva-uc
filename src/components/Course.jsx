import { useContext, useEffect, useRef, useState } from "react";
import { CourseContext } from "../context/CourseContext";
import { EditCourseModal } from "./EditCourseModal";

const LONG_PRESS_MS = 450;
const HOVER_DELAY_MS = 1000;
const MOVE_THRESHOLD_PX = 10;
const MOUSE_SUPPRESS_MS = 900;

export const Course = ({ course }) => {
  const {
    finishedCourses,
    totalCredits,
    handleClick,
    highlightedCourseId,
    setHighlightedCourseId,
    relatedCourseIds,
    prereqIds,
    unlockIds,
    showPrerequisites,
    editMode,
    isInternado,
    reorderInternado,
    updateCourseOverride,
    draggingInternadoId,
    setDraggingInternadoId,
    dragOverInternadoId,
    setDragOverInternadoId,
    recentlySwappedIds,
  } = useContext(CourseContext);

  const [takeCourse, setTakeCourse] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const longPressTimer = useRef(null);
  const hoverTimer = useRef(null);
  const didLongPress = useRef(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const ignoreMouseUntil = useRef(0);
  const didDrag = useRef(false);

  const canReorder = editMode && isInternado(course);
  const canEditLabel = editMode && Boolean(course.labelEditable);
  const isEditDimmed = editMode && !canReorder && !canEditLabel;
  const isDragging = draggingInternadoId === course.id;
  const isDropTarget =
    canReorder &&
    dragOverInternadoId === course.id &&
    draggingInternadoId != null &&
    draggingInternadoId !== course.id;
  const isRecentlySwapped = recentlySwappedIds.has(course.id);
  let editBadgeLabel = "Intercambiable";
  let editBadgeClass = "";
  if (canEditLabel) {
    editBadgeLabel = "Editable";
    editBadgeClass = "course-label-editable-badge";
  } else if (isDragging) {
    editBadgeLabel = "Origen";
    editBadgeClass = "course-drag-source-badge";
  } else if (isDropTarget) {
    editBadgeLabel = "Destino";
    editBadgeClass = "course-drop-target-badge";
  } else {
    editBadgeLabel = "Intercambiable";
  }

  useEffect(() => {
    const isCreditRequired = "rc" in course;
    const creditCheck = isCreditRequired && totalCredits >= 400;

    const reqCheck = course.req.every(req => {
      const isCompleted = finishedCourses.includes(req.id);
      return isCompleted && (!isCreditRequired || creditCheck);
    });

    if ("rc" in course) {
      setTakeCourse(reqCheck && creditCheck);
    } else {
      setTakeCourse(reqCheck);
    }
  }, [finishedCourses, totalCredits, course]);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
      }
    };
  }, []);

  const clearLongPressTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const suppressMouseHover = () => {
    ignoreMouseUntil.current = Date.now() + MOUSE_SUPPRESS_MS;
  };

  const isMouseHoverAllowed = () => Date.now() >= ignoreMouseUntil.current;

  const isFinished = finishedCourses.includes(course.id);
  const isHighlighted = highlightedCourseId === course.id;
  const isRelated = relatedCourseIds.has(course.id);
  const isDimmed =
    highlightedCourseId != null && !isHighlighted && !isRelated;

  const isPrereqRelated = prereqIds.has(course.id);
  const isUnlockRelated = unlockIds.has(course.id);

  let color = "bg-[#F0F0F0]";
  if (course.cc === "bg-[#CCDFF6]") {
    color = "bg-[#CCDFF6]";
  }

  const handleMouseEnter = () => {
    if (editMode || !showPrerequisites || !isMouseHoverAllowed()) return;
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => {
      setHighlightedCourseId(course.id);
      hoverTimer.current = null;
    }, HOVER_DELAY_MS);
  };

  const handleMouseLeave = () => {
    clearHoverTimer();
    if (editMode || !showPrerequisites || !isMouseHoverAllowed()) return;
    setHighlightedCourseId(null);
  };

  const handleTouchStart = event => {
    if (editMode || !showPrerequisites) return;
    suppressMouseHover();
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    didLongPress.current = false;
    clearLongPressTimer();
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setHighlightedCourseId(course.id);
    }, LONG_PRESS_MS);
  };

  const handleTouchMove = event => {
    if (editMode) return;
    const touch = event.touches[0];
    const dx = Math.abs(touch.clientX - touchStart.current.x);
    const dy = Math.abs(touch.clientY - touchStart.current.y);
    if (dx > MOVE_THRESHOLD_PX || dy > MOVE_THRESHOLD_PX) {
      clearLongPressTimer();
      if (didLongPress.current) {
        setHighlightedCourseId(null);
        didLongPress.current = false;
      }
    }
  };

  const handleTouchEnd = () => {
    if (editMode) return;
    suppressMouseHover();
    clearLongPressTimer();
    setHighlightedCourseId(null);
  };

  const handleCourseClick = () => {
    if (canReorder) {
      return;
    }

    if (canEditLabel) {
      setIsEditModalOpen(true);
      return;
    }

    if (editMode) {
      return;
    }

    clearHoverTimer();
    suppressMouseHover();
    setHighlightedCourseId(null);

    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }

    if (didDrag.current) {
      didDrag.current = false;
      return;
    }

    handleClick(course);
  };

  const handleDragStart = event => {
    if (!canReorder) return;
    didDrag.current = true;
    setDraggingInternadoId(course.id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(course.id));
  };

  const handleDragOver = event => {
    if (!canReorder || draggingInternadoId == null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dragOverInternadoId !== course.id) {
      setDragOverInternadoId(course.id);
    }
  };

  const handleDrop = event => {
    if (!canReorder) return;
    event.preventDefault();
    event.stopPropagation();
    const fromId = Number(
      event.dataTransfer.getData("text/plain") || draggingInternadoId
    );
    if (fromId && fromId !== course.id) {
      reorderInternado(fromId, course.id);
    }
    setDraggingInternadoId(null);
    setDragOverInternadoId(null);
  };

  const handleDragEnd = () => {
    setDraggingInternadoId(null);
    setDragOverInternadoId(null);
  };

  const insertionPlaceholder = (
    <div
      className="mx-1 mb-2 flex h-24 w-32 items-center justify-center rounded-lg border-2 border-dashed border-emerald-500 bg-emerald-50 px-2 text-center text-xs font-semibold text-emerald-700"
      aria-hidden="true"
    >
      Intercambiar con este
    </div>
  );

  return (
    <>
      <div
        className="w-fit"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDropTarget && insertionPlaceholder}
        <div
          data-course-id={course.id}
          draggable={canReorder}
          className={`relative w-32 bg-gray-600 mb-2 rounded-lg transition-all duration-200 ${
            canReorder
              ? "cursor-grab active:cursor-grabbing course-editable"
              : canEditLabel
                ? "cursor-pointer course-label-editable"
                : "hover:cursor-pointer"
          } ${isFinished ? "custom-line" : ""} ${
            !takeCourse && !editMode ? "opacity-25" : ""
          } ${isDimmed && !editMode ? "course-dimmed" : ""} ${
            isEditDimmed ? "course-edit-dimmed" : ""
          } ${isHighlighted ? "course-highlighted" : ""} ${
            isPrereqRelated ? "course-related-prereq" : ""
          } ${isUnlockRelated ? "course-related-unlock" : ""} ${
            isDragging ? "course-drag-source scale-95" : ""
          } ${isDropTarget ? "course-drop-target" : ""} ${
            isRecentlySwapped ? "ring-4 ring-amber-400 animate-pulse" : ""
          } mx-1`}
          onClick={handleCourseClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onContextMenu={event => event.preventDefault()}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {(canReorder || canEditLabel) && (
            <>
              <div className={`course-editable-badge ${editBadgeClass}`}>
                {editBadgeLabel}
              </div>
              {canReorder && (
                <div className="absolute left-1 top-1 z-20 rounded bg-black/45 px-1 text-[9px] font-bold text-white">
                  ⋮⋮
                </div>
              )}
            </>
          )}

          <div className="flex justify-between items-center h-6">
            <p className="text-white font-bold text-xs pl-1">{course.code}</p>
            <div className="bg-white course-code mr-1">
              <p className="">{course.id}</p>
            </div>
          </div>
          <div
            className={`${color} h-12 flex justify-center items-center text-center w-full `}
          >
            <p className="line-clamp text-sm">{course.course}</p>
          </div>
          <div className="flex justify-between p-1">
            <div className="flex justify-start">
              {course.req.map(r => (
                <div key={r.id} className={`course-code ${color} mx-0 border`}>
                  <p className="text-xs">{r.id}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <p
                className={`${
                  course.cr ? "bg-white" : ""
                } h-4 w-4 text-center text-xs`}
              >
                {course.cr}
              </p>
            </div>
          </div>
        </div>
      </div>

      <EditCourseModal
        open={isEditModalOpen}
        course={course}
        onClose={() => setIsEditModalOpen(false)}
        onSave={override => updateCourseOverride(course.id, override)}
      />
    </>
  );
};
