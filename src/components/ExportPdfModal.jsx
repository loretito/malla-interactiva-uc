import { useContext, useEffect, useState } from "react";
import { CourseContext } from "../context/CourseContext";
import { exportMallaPdf } from "../utils/export-malla-pdf";

export const ExportPdfModal = ({ open, onClose }) => {
  const {
    title,
    showToast,
    coursesBySemesterAndYear,
    finishedCourses,
    activeTypeColors,
    showTypeColors,
  } = useContext(CourseContext);
  const [includeMarkedCourses, setIncludeMarkedCourses] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    setIncludeMarkedCourses(false);

    const handleKeyDown = event => {
      if (event.key === "Escape" && !isExporting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, isExporting]);

  if (!open) {
    return null;
  }

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportMallaPdf({
        title,
        coursesBySemesterAndYear,
        finishedCourses,
        activeTypeColors,
        showTypeColors,
        includeMarkedCourses,
      });
      showToast?.("PDF descargado");
      onClose();
    } catch {
      showToast?.("No se pudo generar el PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => {
        if (!isExporting) onClose();
      }}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl text-gray-800"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-pdf-title"
      >
        <h2
          id="export-pdf-title"
          className="mb-2 text-lg font-bold text-[#2d5699]"
        >
          Obtener malla en PDF
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Se descargará un PDF de {title}.
        </p>

        <label className="mb-5 flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5 hover:bg-gray-50">
          <span className="text-sm text-gray-700">
            Incluir cursos marcados
            <span className="mt-0.5 block text-xs text-gray-500">
              Si está desactivado, la malla se exporta sin tachados
            </span>
          </span>
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-[#2d5699]"
            checked={includeMarkedCourses}
            onChange={event => setIncludeMarkedCourses(event.target.checked)}
            disabled={isExporting}
          />
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="rounded-lg bg-[#2d5699] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#1e427a] disabled:opacity-50"
          >
            {isExporting ? "Generando…" : "Descargar PDF"}
          </button>
        </div>
      </div>
    </div>
  );
};
