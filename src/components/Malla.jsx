import { useContext } from "react";
import { CourseContext } from "../context/CourseContext";
import { Semesters } from "../components";

export const Malla = () => {
  const { coursesBySemesterAndYear } = useContext(CourseContext);
  return (
    <div className="flex xl:justify-center overflow-x-auto">
      {Object.entries(coursesBySemesterAndYear).map(
        ([year, coursesBySemester]) => (
          <div key={year} className="">
            <h2 className="bg-[#2d5699] text-center m-1 text-white font-bold rounded-md">{`Año ${year}`}</h2>
            <div className="flex">
              {Object.entries(coursesBySemester).map(([semester, courses]) => (
                <Semesters
                  key={`${year}-${semester}`}
                  semester={semester}
                  courses={courses}
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};
