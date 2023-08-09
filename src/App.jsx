import { useEffect, useState } from "react";
import { ramos2016 } from "./utils/malla-2016";
import { Semesters } from "./components/Semesters";
import { Button } from "./components/Button";
import { Navbar } from "./components/Navbar";
import { ramos2023 } from "./utils/malla-2023";
import { Footer } from "./components/Footer";

const storedFinishedCourses =
  JSON.parse(localStorage.getItem("finishedCourses")) || [];

const credits = JSON.parse(localStorage.getItem("credits")) || 0;

const stored = JSON.parse(localStorage.getItem("stored")) || "Malla Nueva";

function App() {
  const [finishedCourses, setFinishedCourses] = useState(storedFinishedCourses);
  const [totalCredits, setTotalCredits] = useState(credits);

  const [title, setTitle] = useState(stored);

  const data = title === "Malla Nueva" ? ramos2023 : ramos2016;

  const coursesBySemesterAndYear = data.reduce((acc, course) => {
    const { year, semester } = course;
    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][semester]) {
      acc[year][semester] = [];
    }
    acc[year][semester].push(course);
    return acc;
  }, {});

  useEffect(() => {
    localStorage.setItem("finishedCourses", JSON.stringify(finishedCourses));
    localStorage.setItem("credits", JSON.stringify(totalCredits));
  }, [finishedCourses]);

  useEffect(() => {
    localStorage.setItem("stored", JSON.stringify(title));
  }, [title]);

  const handleReset = () => {
    setTotalCredits(0);
    setFinishedCourses([]);
  };
  console.log(finishedCourses.length);
  return (
    <>
      <Navbar title={title} setTitle={setTitle} handleReset={handleReset} />
      <div className="max-w-screen-xl mx-auto">
        <Button handleReset={handleReset} />
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
      </div>
      <div className="flex xl:justify-center overflow-x-auto">
        {Object.entries(coursesBySemesterAndYear).map(
          ([year, coursesBySemester]) => (
            <div key={year} className="">
              <h2 className="bg-[#2d5699] text-center m-1 text-white font-bold rounded-md">{`Año ${year}`}</h2>
              <div className="flex">
                {Object.entries(coursesBySemester).map(
                  ([semester, courses]) => (
                    <Semesters
                      key={`${year}-${semester}`}
                      semester={semester}
                      courses={courses}
                      finishedCourses={finishedCourses}
                      setFinishedCourses={setFinishedCourses}
                      setTotalCredits={setTotalCredits}
                      totalCredits={totalCredits}
                    />
                  )
                )}
              </div>
            </div>
          )
        )}
      </div>

      <div className="flex  my-4 items-center mx-auto justify-center">
        <div className="w-80 text-justify sm:block hidden mr-16">
          Puedes tachar tus ramos aprobados haciendo click en ellos. A medida
          que vas aprobando ramos, se van liberando los que tienen
          prerrequisitos
        </div>
        <div className="w-80 ">
          <img src="/course-info.png" />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default App;
