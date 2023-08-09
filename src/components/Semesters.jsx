import React, { useContext } from "react";
import { Course } from "./Course";
import { CourseContext } from "../context/CourseContext";

export const Semesters = ({ semester, courses }) => {
  const { finishedCourses, setFinishedCourses, totalCredits, setTotalCredits } =
    useContext(CourseContext);

  return (
    <div className="">
      <h2 className="text-center bg-[#327ddb] mx-1 mb-2 text-white font-semibold rounded-md hover:cursor-pointer hover:bg-[#1160C2]">
        {semester}
      </h2>
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
