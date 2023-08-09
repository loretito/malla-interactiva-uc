import React, { useContext, useEffect, useState } from "react";
import { CourseContext } from "../context/CourseContext";

export const Course = ({ course }) => {
  const { finishedCourses, totalCredits, handleClick } =
    useContext(CourseContext);

  const [takeCourse, setTakeCourse] = useState(false);

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
  }, [finishedCourses]);

  const isFinished = finishedCourses.includes(course.id);
  let color = "bg-[#F0F0F0]";
  if (course.cc === "bg-[#CCDFF6]") {
    color = "bg-[#CCDFF6]";
  }

  return (
    <div
      className={`w-32 bg-gray-600 mb-2 rounded-lg hover:cursor-pointer ${
        isFinished ? "custom-line" : ""
      } ${!takeCourse ? "opacity-25" : ""} mx-1`}
      onClick={() => handleClick(course)}
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
          {/* creditos */}
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
