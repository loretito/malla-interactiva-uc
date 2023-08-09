import React, { useContext } from "react";
import { CourseContext } from "../context/CourseContext";

export const Stats = () => {
  const { totalCredits, finishedCourses } = useContext(CourseContext);

  return (
    <div className="flex">
      <div className="flex mr-12">
        <p className="mr-2">Total creditos: {totalCredits}</p>{" "}
        <p>({((totalCredits * 100) / 500).toFixed(1)}%)</p>
      </div>

      <div className="flex">
        <p className="mr-2">Ramos aprobados: {finishedCourses.length}</p>
        <p>({((finishedCourses.length * 100) / 55).toFixed(1)}%)</p>
      </div>
    </div>
  );
};
