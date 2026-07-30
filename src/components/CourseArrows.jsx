import { useContext, useEffect, useState } from "react";
import { CourseContext } from "../context/CourseContext";
import { PREREQ_COLOR, UNLOCK_COLOR } from "../utils/relation-colors";

const TIP_LENGTH = 12;
const ARC_BASE = 48;

const getBox = (el, container) => {
  const rect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const x = rect.left + rect.width / 2 - containerRect.left + container.scrollLeft;
  const y = rect.top + rect.height / 2 - containerRect.top + container.scrollTop;

  return {
    id: el.dataset.courseId,
    x,
    y,
    width: rect.width,
    height: rect.height,
    left: x - rect.width / 2,
    right: x + rect.width / 2,
    top: y - rect.height / 2,
    bottom: y + rect.height / 2,
  };
};

const pointOnCubic = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return {
    x:
      u * u * u * p0.x +
      3 * u * u * t * p1.x +
      3 * u * t * t * p2.x +
      t * t * t * p3.x,
    y:
      u * u * u * p0.y +
      3 * u * u * t * p1.y +
      3 * u * t * t * p2.y +
      t * t * t * p3.y,
  };
};

const boxContains = (box, point, padding = 4) =>
  point.x >= box.left - padding &&
  point.x <= box.right + padding &&
  point.y >= box.top - padding &&
  point.y <= box.bottom + padding;

const buildPathParts = (start, c1, tipTarget, fromTop) => {
  const intoY = fromTop ? 1 : -1;
  const tip = {
    x: tipTarget.x,
    y: tipTarget.y - intoY,
  };
  const preTip = {
    x: tip.x,
    y: tip.y - intoY * TIP_LENGTH,
  };
  const c2 = {
    x: preTip.x,
    y: preTip.y - intoY * 20,
  };

  return {
    body: `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${preTip.x} ${preTip.y}`,
    tip: `M ${preTip.x} ${preTip.y} L ${tip.x} ${tip.y}`,
    controls: { start, c1, c2, end: preTip },
  };
};

const countHits = (path, boxes, ignoreIds) => {
  const { start, c1, c2, end } = path.controls;
  let hits = 0;

  for (let i = 1; i <= 10; i += 1) {
    const point = pointOnCubic(start, c1, c2, end, i / 11);
    if (boxes.some(box => !ignoreIds.has(box.id) && boxContains(box, point))) {
      hits += 1;
    }
  }

  return hits;
};

const buildVerticalRailPath = (from, to, pathIndex, preferAbove) => {
  const arc = ARC_BASE + pathIndex * 10;
  const start = preferAbove
    ? { x: from.x, y: from.top }
    : { x: from.x, y: from.bottom };
  const tipTarget = preferAbove
    ? { x: to.x, y: to.top }
    : { x: to.x, y: to.bottom };
  const railY = preferAbove
    ? Math.min(from.top, to.top) - arc
    : Math.max(from.bottom, to.bottom) + arc;
  const stagger = (pathIndex % 3) * 12 - 12;
  const midX = (start.x + tipTarget.x) / 2 + stagger;

  return buildPathParts(start, { x: midX, y: railY }, tipTarget, preferAbove);
};

const pickClearerRail = (from, to, boxes, pathIndex) => {
  const ignoreIds = new Set([from.id, to.id]);
  const above = buildVerticalRailPath(from, to, pathIndex, true);
  const below = buildVerticalRailPath(from, to, pathIndex, false);
  const aboveHits = countHits(above, boxes, ignoreIds);
  const belowHits = countHits(below, boxes, ignoreIds);

  if (aboveHits === belowHits) {
    return aboveHits === 0
      ? above
      : buildVerticalRailPath(from, to, pathIndex + 3, true);
  }

  if (aboveHits < belowHits) {
    return aboveHits === 0
      ? above
      : buildVerticalRailPath(from, to, pathIndex + 3, true);
  }

  return belowHits === 0
    ? below
    : buildVerticalRailPath(from, to, pathIndex + 3, false);
};

const buildPath = (fromEl, toEl, container, boxes, pathIndex) => {
  const from = getBox(fromEl, container);
  const to = getBox(toEl, container);
  return pickClearerRail(from, to, boxes, pathIndex);
};

export const CourseArrows = ({ containerRef }) => {
  const { highlightedCourseId, coursesById, dependentsById } =
    useContext(CourseContext);
  const [paths, setPaths] = useState([]);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !highlightedCourseId) {
      setPaths([]);
      return undefined;
    }

    const updatePaths = () => {
      const courseEl = container.querySelector(
        `[data-course-id="${highlightedCourseId}"]`
      );
      const course = coursesById.get(highlightedCourseId);

      if (!courseEl || !course) {
        setPaths([]);
        return;
      }

      const boxes = [...container.querySelectorAll("[data-course-id]")].map(el =>
        getBox(el, container)
      );

      const nextPaths = [];
      let pathIndex = 0;

      course.req.forEach(req => {
        const fromEl = container.querySelector(`[data-course-id="${req.id}"]`);
        if (!fromEl) return;

        const segments = buildPath(
          fromEl,
          courseEl,
          container,
          boxes,
          pathIndex
        );
        nextPaths.push({
          key: `req-${req.id}-${highlightedCourseId}`,
          body: segments.body,
          tip: segments.tip,
          color: PREREQ_COLOR,
          marker: "arrow-prereq",
          dashed: true,
        });
        pathIndex += 1;
      });

      (dependentsById[highlightedCourseId] || []).forEach(depId => {
        const toEl = container.querySelector(`[data-course-id="${depId}"]`);
        if (!toEl) return;

        const segments = buildPath(courseEl, toEl, container, boxes, pathIndex);
        nextPaths.push({
          key: `dep-${highlightedCourseId}-${depId}`,
          body: segments.body,
          tip: segments.tip,
          color: UNLOCK_COLOR,
          marker: "arrow-unlock",
          dashed: false,
        });
        pathIndex += 1;
      });

      setPaths(nextPaths);
      setSize({
        width: container.scrollWidth,
        height: container.scrollHeight,
      });
    };

    updatePaths();

    const handleUpdate = () => updatePaths();
    container.addEventListener("scroll", handleUpdate);
    window.addEventListener("resize", handleUpdate);

    return () => {
      container.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [highlightedCourseId, coursesById, dependentsById, containerRef]);

  if (!highlightedCourseId || paths.length === 0) {
    return null;
  }

  return (
    <svg
      className="course-arrows"
      width={size.width}
      height={size.height}
      aria-hidden="true"
    >
      <defs>
        <marker
          id="arrow-prereq"
          viewBox="0 0 10 10"
          markerWidth="9"
          markerHeight="9"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={PREREQ_COLOR} />
        </marker>
        <marker
          id="arrow-unlock"
          viewBox="0 0 10 10"
          markerWidth="9"
          markerHeight="9"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={UNLOCK_COLOR} />
        </marker>
      </defs>
      {paths.map(path => (
        <g key={path.key}>
          <path
            d={path.body}
            fill="none"
            stroke={path.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={path.dashed ? "6 5" : undefined}
            className="course-arrow-path"
          />
          <path
            d={path.tip}
            fill="none"
            stroke={path.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            markerEnd={`url(#${path.marker})`}
            className="course-arrow-path"
          />
        </g>
      ))}
    </svg>
  );
};
