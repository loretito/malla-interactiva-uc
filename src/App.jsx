import { useEffect, useState } from "react";
import { ramos2013 } from "./utils/malla-2013";
import { Semesters } from "./components/Semesters";

function App() {
  const [finishedCourses, setFinishedCourses] = useState([]);

  const coursesBySemester = ramos2013.reduce((acc, course) => {
    if (!acc[course.semester]) {
      acc[course.semester] = [];
    }
    acc[course.semester].push(course);
    return acc;
  }, {});

  useEffect(() => {
    const storedFinishedCourses = localStorage.getItem("finishedCourses");
    if (storedFinishedCourses) {
      setFinishedCourses(JSON.parse(storedFinishedCourses));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("finishedCourses", JSON.stringify(finishedCourses));
  }, [finishedCourses]);

  return (
    <div>
      <h1>Cursos</h1>
      <div className="flex">
        {Object.entries(coursesBySemester).map(([semester, courses]) => (
          <Semesters
            key={semester}
            semester={semester}
            courses={courses}
            finishedCourses={finishedCourses}
            setFinishedCourses={setFinishedCourses}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
