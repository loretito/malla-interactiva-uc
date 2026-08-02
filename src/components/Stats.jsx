import { useContext } from "react";
import { CourseContext } from "../context/CourseContext";

export const Stats = () => {
  const { totalCredits, finishedCourses } = useContext(CourseContext);

  return (
    <div className="grid grid-cols-2 gap-2 text-sm sm:flex sm:gap-12 sm:text-base">
      <div className="rounded-lg bg-gray-50 px-3 py-2 sm:flex sm:items-baseline sm:gap-2 sm:bg-transparent sm:p-0">
        <p className="text-xs text-gray-600 sm:text-base sm:text-gray-900">
          Total créditos
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold text-gray-900 sm:text-base sm:font-normal">
            {totalCredits}
          </span>
          <span className="text-xs text-gray-500 sm:text-base sm:text-gray-900">
            ({((totalCredits * 100) / 500).toFixed(1)}%)
          </span>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 px-3 py-2 sm:flex sm:items-baseline sm:gap-2 sm:bg-transparent sm:p-0">
        <p className="text-xs text-gray-600 sm:text-base sm:text-gray-900">
          Ramos aprobados
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold text-gray-900 sm:text-base sm:font-normal">
            {finishedCourses.length}
          </span>
          <span className="text-xs text-gray-500 sm:text-base sm:text-gray-900">
            ({((finishedCourses.length * 100) / 55).toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
};
