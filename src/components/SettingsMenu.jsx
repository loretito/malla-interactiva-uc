import { useContext, useEffect, useRef, useState } from "react";
import { CourseContext } from "../context/CourseContext";
import { ExportPdfModal } from "./ExportPdfModal";
import { WhatsNewModal } from "./WhatsNewModal";

export const SettingsMenu = () => {
  const {
    showPrerequisites,
    toggleShowPrerequisites,
    showTypeColors,
    toggleShowTypeColors,
    editMode,
    toggleEditMode,
  } = useContext(CourseContext);

  const [isOpen, setIsOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsOpen(open => !open)}
          className="inline-flex items-center justify-center p-2 w-10 h-10 text-sm text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 border border-gray-200 bg-white"
          aria-label="Configuración"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            fill="currentColor"
          >
            <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.2 7.2 0 0 0-1.62-.94l-.36-2.54A.49.49 0 0 0 13.9 2h-3.8a.49.49 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.55-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.47a.49.49 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.86 14.53a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.3.59.22l2.39-.96c.5.39 1.03.71 1.62.94l.36 2.54c.05.24.24.41.48.41h3.8c.24 0 .43-.17.48-.41l.36-2.54c.59-.24 1.13-.55 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-800">
            <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">
              Configuración
            </p>

            <label className="mb-3 flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Mostrar prerrequisitos
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#2d5699]"
                checked={showPrerequisites}
                onChange={toggleShowPrerequisites}
              />
            </label>

            <label className="mb-3 flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Ver colores por tipo
                <span className="mt-0.5 block text-xs text-gray-500">
                  Colorea ramos según su categoría
                </span>
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#2d5699]"
                checked={showTypeColors}
                onChange={toggleShowTypeColors}
              />
            </label>

            <label className="mb-3 flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Modo edición
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#2d5699]"
                checked={editMode}
                onChange={() => {
                  toggleEditMode();
                  setIsOpen(false);
                }}
              />
            </label>

            <button
              type="button"
              className="mb-2 w-full rounded-lg border border-[#2d5699]/30 bg-[#e8f1fb] px-3 py-2 text-sm font-semibold text-[#2d5699] hover:bg-[#d9e7f8]"
              onClick={() => {
                setIsPdfOpen(true);
                setIsOpen(false);
              }}
            >
              Obtener malla en PDF
            </button>

            <button
              type="button"
              className="w-full rounded-lg bg-[#2d5699] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1e427a]"
              onClick={() => {
                setIsWhatsNewOpen(true);
                setIsOpen(false);
              }}
            >
              Ver novedades
            </button>
          </div>
        )}
      </div>

      <ExportPdfModal open={isPdfOpen} onClose={() => setIsPdfOpen(false)} />

      <WhatsNewModal
        open={isWhatsNewOpen}
        onClose={() => setIsWhatsNewOpen(false)}
      />
    </>
  );
};
