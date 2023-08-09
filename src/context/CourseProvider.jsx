import React, { useEffect, useState } from "react";
import { CourseContext } from "./CourseContext";
import { ramos2016, ramos2023 } from "../utils";

//get info from localStorage
const storedFinishedCourses =
  JSON.parse(localStorage.getItem("finishedCourses")) || [];
const credits = JSON.parse(localStorage.getItem("credits")) || 0;
const stored = JSON.parse(localStorage.getItem("stored")) || "Malla Nueva";

export const CourseProvider = ({ children }) => {
  //set info from localStorage
  const [finishedCourses, setFinishedCourses] = useState(storedFinishedCourses);
  const [totalCredits, setTotalCredits] = useState(credits);
  const [title, setTitle] = useState(stored);

  // use malla selected
  const data = title === "Malla Nueva" ? ramos2023 : ramos2016;

  // divide courses by semester
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

  //To store finishedCourse and credits
  useEffect(() => {
    localStorage.setItem("finishedCourses", JSON.stringify(finishedCourses));
    localStorage.setItem("credits", JSON.stringify(totalCredits));
  }, [finishedCourses]);

  //Store the title
  useEffect(() => {
    localStorage.setItem("stored", JSON.stringify(title));
  }, [title]);

  //To reset everything
  const handleReset = () => {
    setTotalCredits(0);
    setFinishedCourses([]);
  };

  //TAKE A COURSE

  const handleClick = course => {
    const isFinished = finishedCourses.includes(course.id);
    if (!isFinished) {
      if (course.cr) setTotalCredits(state => state + course.cr);

      setFinishedCourses(prevFinishedCourses => [
        ...prevFinishedCourses,
        course.id,
      ]);
    } else {
      if (course.cr) setTotalCredits(state => state - course.cr);
      setFinishedCourses(prevFinishedCourses =>
        prevFinishedCourses.filter(id => id != course.id)
      );
    }
  };

  return (
    <CourseContext.Provider
      value={{
        title,
        setTitle,
        handleReset,
        totalCredits,
        setTotalCredits,
        finishedCourses,
        setFinishedCourses,
        coursesBySemesterAndYear,
        handleClick,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
