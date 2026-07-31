import { useContext } from "react";
import { CourseContext } from "../context/CourseContext";

export const EditModeBanner = () => {
  const {
    editMode,
    saveEditMode,
    cancelEditMode,
    hasUnsavedInternadoChanges,
  } = useContext(CourseContext);

  if (!editMode) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 mb-2 border-b border-[#2d5699]/30 bg-[#e8f1fb] px-3 py-2 shadow-sm">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#2d5699]">
            Estás en modo edición
          </p>
          <p className="text-xs text-[#1e427a]">
            Arrastra los Internados para ordenarlos a tu preferencia.
            {hasUnsavedInternadoChanges ? " Hay cambios sin guardar." : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cancelEditMode}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={saveEditMode}
            className="rounded-lg bg-[#2d5699] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#1e427a]"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
