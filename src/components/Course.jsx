import { useContext, useEffect, useRef, useState } from "react";
import { CourseContext } from "../context/CourseContext";

const LONG_PRESS_MS = 450;
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
  } = useContext(CourseContext);

  const [takeCourse, setTakeCourse] = useState(false);
  const longPressTimer = useRef(null);
  const didLongPress = useRef(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const ignoreMouseUntil = useRef(0);

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
    };
  }, []);

  const clearLongPressTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
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
    if (!isMouseHoverAllowed()) return;
    setHighlightedCourseId(course.id);
  };

  const handleMouseLeave = () => {
    if (!isMouseHoverAllowed()) return;
    setHighlightedCourseId(null);
  };

  const handleTouchStart = event => {
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
    suppressMouseHover();
    clearLongPressTimer();
    setHighlightedCourseId(null);
  };

  const handleCourseClick = () => {
    suppressMouseHover();
    setHighlightedCourseId(null);

    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }

    handleClick(course);
  };

  return (
    <div
      data-course-id={course.id}
      className={`w-32 bg-gray-600 mb-2 rounded-lg hover:cursor-pointer transition-all duration-200 ${
        isFinished ? "custom-line" : ""
      } ${!takeCourse ? "opacity-25" : ""} ${
        isDimmed ? "course-dimmed" : ""
      } ${isHighlighted ? "course-highlighted" : ""} ${
        isPrereqRelated ? "course-related-prereq" : ""
      } ${isUnlockRelated ? "course-related-unlock" : ""} mx-1`}
      onClick={handleCourseClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onContextMenu={event => event.preventDefault()}
    >
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
  );
};
