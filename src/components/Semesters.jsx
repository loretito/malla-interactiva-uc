import React from "react";
import { Course } from "./Course";

export const Semesters = ({
  semester,
  courses,
  finishedCourses,
  setFinishedCourses,
  setTotalCredits,
  totalCredits
}) => {

  return (
    <div className="">
      <h2 className="text-center bg-[#327ddb] mx-1 mb-2 text-white font-semibold rounded-md hover:cursor-pointer">{semester}</h2>
      {courses.map(course => (
        <Course
          key={course.id}
          course={course}
          finishedCourses={finishedCourses}
          setFinishedCourses={setFinishedCourses}
          setTotalCredits={setTotalCredits}
          totalCredits={totalCredits}
        />
      ))}
    </div>
  );
};
