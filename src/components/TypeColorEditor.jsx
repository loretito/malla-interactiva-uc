import { useContext, useEffect, useRef, useState } from "react";
import { CourseContext } from "../context/CourseContext";
import { TYPE_COLOR_PALETTE } from "../utils/course-type-colors";

const ColorRow = ({ label, value, onChange }) => {
  const selectedHex = String(value || "").toUpperCase();

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-2.5 py-2">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-gray-800">{label}</p>
        <span
          className="h-4 w-4 shrink-0 rounded-full border border-black/10 shadow-sm"
          style={{ backgroundColor: value }}
          aria-hidden="true"
        />
      </div>
      <div
        className="grid grid-cols-5 gap-1.5"
        role="listbox"
        aria-label={`Color de ${label}`}
      >
        {TYPE_COLOR_PALETTE.map(color => {
          const isSelected = color.hex.toUpperCase() === selectedHex;
          return (
            <button
              key={color.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              aria-label={color.label}
              title={color.label}
              onClick={() => onChange(color.hex)}
              className={`flex h-8 w-full items-center justify-center rounded-md border transition ${
                isSelected
                  ? "border-[#2d5699] ring-2 ring-[#2d5699]/35"
                  : "border-black/10 hover:border-[#2d5699]/50"
              }`}
              style={{ backgroundColor: color.hex }}
            />
          );
        })}
      </div>
    </div>
  );
};

export const TypeColorEditor = () => {
  const {
    editMode,
    courseTypesInMalla,
    activeTypeColors,
    updateTypeColor,
    showTypeColors,
  } = useContext(CourseContext);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = event => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!editMode) {
      setIsOpen(false);
    }
  }, [editMode]);

  if (!editMode) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        aria-label="Colores por tipo"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span
          className="h-3.5 w-3.5 rounded-full border border-black/10"
          style={{
            background:
              "conic-gradient(#e8d9a8, #a8d4c4, #ccdff6, #9bb8e6, #7bcfc4, #e8d9a8)",
          }}
          aria-hidden="true"
        />
        Colores
        <span
          className={`text-xs text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            aria-label="Cerrar colores"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-3 bottom-3 z-50 max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3 shadow-xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[22rem] sm:max-h-[70vh] sm:rounded-xl">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[#2d5699]">
                  Colores de la malla
                </p>
                <p className="text-xs text-gray-500">
                  Toca un color para cada grupo. Recuerda guardar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 sm:hidden"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {!showTypeColors && (
              <p className="mb-2 rounded-lg bg-amber-50 px-2.5 py-2 text-xs font-medium text-amber-800">
                Activa “Ver colores por tipo” en la ruedita para verlos.
              </p>
            )}

            <div className="grid grid-cols-1 gap-2">
              {courseTypesInMalla.map(({ key, label }) => (
                <ColorRow
                  key={key}
                  label={label}
                  value={activeTypeColors[key]}
                  onChange={hex => updateTypeColor(key, hex)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
