import { useContext } from "react";
import { Course } from "./Course";
import { CourseContext } from "../context/CourseContext";

export const Semesters = ({ semester, courses }) => {
  const { handleClick } = useContext(CourseContext);

  const handleSemesterClick = () => {
    courses.map(course => handleClick(course));
  };

  return (
    <div className="">
      <h2
        className="text-center bg-[#327ddb] mx-1 mb-2 text-white font-semibold rounded-md hover:cursor-pointer hover:bg-[#1160C2]"
        onClick={() => handleSemesterClick(courses)}
      >
        {semester}
      </h2>
      {courses.map(course => (
        <Course key={course.id} course={course} />
      ))}
    </div>
  );
};
