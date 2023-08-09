import React from "react";

export const Info = () => {
  return (
    <div className="flex  my-4 items-center mx-auto justify-center">
      <div className="w-80 text-justify sm:block hidden mr-16">
        Puedes tachar tus ramos aprobados haciendo click en ellos. A medida que
        vas aprobando ramos, se van liberando los que tienen prerrequisitos
      </div>
      <div className="w-80 ">
        <img src="/course-info.png" />
      </div>
    </div>
  );
};
