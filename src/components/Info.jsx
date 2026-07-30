import { PREREQ_COLOR, UNLOCK_COLOR } from "../utils/relation-colors";

export const Info = () => {
  return (
    <div className="flex flex-col sm:flex-row my-4 items-center mx-auto justify-center gap-4 px-4">
      <div className="w-96 text-justify hidden sm:block">
        Puedes tachar tus ramos aprobados haciendo click en ellos. A medida que
        vas aprobando ramos, se van liberando los que tienen prerrequisitos.
        Pasa el mouse por un ramo (o mantén presionado en el celular) para ver
        sus requisitos previos en
        <span className="font-semibold" style={{ color: PREREQ_COLOR }}>
          {" "}
          naranjo (flecha punteada)
        </span>{" "}
        y los ramos que abre en
        <span className="font-semibold" style={{ color: UNLOCK_COLOR }}>
          {" "}
          celeste (flecha continua)
        </span>
        .
      </div>
      <div className="w-96 text-sm text-center sm:hidden px-2">
        Mantén presionado un ramo: requisitos en
        <span className="font-semibold" style={{ color: PREREQ_COLOR }}>
          {" "}
          naranjo (punteado)
        </span>
        , ramos que abre en
        <span className="font-semibold" style={{ color: UNLOCK_COLOR }}>
          {" "}
          celeste
        </span>
        .
      </div>
      <div className="w-96">
        <img src="/course-info.png" alt="Leyenda de la malla" />
      </div>
    </div>
  );
};
