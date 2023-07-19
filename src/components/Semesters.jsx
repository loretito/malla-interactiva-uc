import React from "react";
import { Course } from "./Course";

export const Semesters = ({
  semester,
  courses,
  finishedCourses,
  setFinishedCourses,
}) => {
  return (
    <div className="">
      <h2 className="text-center bg-[#327ddb] mx-1 mb-2">{semester}</h2>
      {courses.map(course => (
        <Course
          key={course.id}
          course={course}
          finishedCourses={finishedCourses}
          setFinishedCourses={setFinishedCourses}
        />
      ))}
    </div>
  );
};
