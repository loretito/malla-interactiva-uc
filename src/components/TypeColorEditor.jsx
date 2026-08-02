import { useContext, useEffect, useRef, useState } from "react";
import { CourseContext } from "../context/CourseContext";
import {
  getPaletteColor,
  TYPE_COLOR_PALETTE,
} from "../utils/course-type-colors";

const ColorSelect = ({ typeKey, label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = getPaletteColor(value) || TYPE_COLOR_PALETTE[0];

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = event => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = event => {
      if (event.key === "Escape") {
        setOpen(false);
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
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <p className="mb-1 text-xs font-medium leading-snug text-gray-800">
        {label}
      </p>
      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        className="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-left hover:border-[#2d5699] focus:outline-none focus:ring-2 focus:ring-[#2d5699]/25"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Color de ${label}: ${selected.hex}`}
      >
        <span
          className="h-5 w-5 shrink-0 rounded-md border border-black/10"
          style={{ backgroundColor: selected.hex }}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1 font-mono text-sm text-gray-800">
          {selected.hex}
        </span>
        <span className="shrink-0 text-xs text-gray-400" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <ul
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {TYPE_COLOR_PALETTE.map(color => {
            const isSelected = color.hex === selected.hex;
            return (
              <li key={`${typeKey}-${color.id}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(color.hex);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left hover:bg-[#e8f1fb] ${
                    isSelected ? "bg-[#e8f1fb]" : ""
                  }`}
                >
                  <span
                    className="h-5 w-5 shrink-0 rounded-md border border-black/10"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-sm text-gray-800">
                    {color.hex}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
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

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
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
              "conic-gradient(#2d5699, #9bb8e6, #69d2cd, #f0c9a8, #d2c4ee, #2d5699)",
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
        <div className="absolute right-0 z-40 mt-2 w-[min(92vw,28rem)] rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
          <p className="text-sm font-semibold text-[#2d5699]">
            Colores por tipo de ramo
          </p>
          <p className="mb-2 text-xs text-gray-500">
            Recuerda guardar.
            {!showTypeColors && (
              <span className="mt-1 block font-medium text-amber-700">
                Activa “Ver colores por tipo” en la ruedita para verlos.
              </span>
            )}
          </p>

          <div className="grid max-h-[60vh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {courseTypesInMalla.map(({ key, label }) => (
              <ColorSelect
                key={key}
                typeKey={key}
                label={label}
                value={activeTypeColors[key]}
                onChange={hex => updateTypeColor(key, hex)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
