import React, { useContext } from "react";
import { CourseContext } from "../context/CourseContext";

export const Button = () => {
  const { handleReset } = useContext(CourseContext);
  return (
    <button
      type="button"
      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-1 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 "
      onClick={handleReset}
    >
      Limpiar Cursos
    </button>
  );
};
