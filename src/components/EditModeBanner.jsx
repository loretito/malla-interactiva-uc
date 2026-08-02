import { useContext, useState } from "react";
import { CourseContext } from "../context/CourseContext";
import { ConfirmResetModal } from "./ConfirmResetModal";

export const EditModeBanner = () => {
  const {
    title,
    editMode,
    saveEditMode,
    cancelEditMode,
    hasUnsavedInternadoChanges,
    resetMallaToDefault,
  } = useContext(CourseContext);
  const [isResetOpen, setIsResetOpen] = useState(false);

  if (!editMode) {
    return null;
  }

  return (
    <>
      <div
        className={`sticky top-0 z-40 mb-2 border-b px-3 py-2 shadow-sm ${
          hasUnsavedInternadoChanges
            ? "border-amber-400 bg-amber-100"
            : "border-[#2d5699]/30 bg-[#e8f1fb]"
        }`}
      >
        <div className="mx-auto flex max-w-[1360px] flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p
                className={`text-sm font-semibold ${
                  hasUnsavedInternadoChanges
                    ? "text-amber-900"
                    : "text-[#2d5699]"
                }`}
              >
                Estás en modo edición
              </p>
              {hasUnsavedInternadoChanges && (
                <span className="inline-flex items-center rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                  Cambios sin guardar
                </span>
              )}
            </div>
            <p
              className={`text-xs ${
                hasUnsavedInternadoChanges
                  ? "text-amber-800"
                  : "text-[#1e427a]"
              }`}
            >
              Edita nombres, colores por tipo o Internados. Pulsa Guardar para
              confirmar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsResetOpen(true)}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Volver a default
            </button>
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
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white ${
                hasUnsavedInternadoChanges
                  ? "bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-300 ring-offset-1"
                  : "bg-[#2d5699] hover:bg-[#1e427a]"
              }`}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>

      <ConfirmResetModal
        open={isResetOpen}
        title={title}
        onConfirm={resetMallaToDefault}
        onClose={() => setIsResetOpen(false)}
      />
    </>
  );
};
