import { useEffect, useState } from "react";

export const EditCourseModal = ({ open, course, onSave, onClose }) => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open || !course) return;
    setCode(course.code || "");
    setName(course.course || "");
  }, [open, course]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = event => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !course) {
    return null;
  }

  const canSave = name.trim().length > 0;

  const handleSubmit = event => {
    event.preventDefault();
    if (!canSave) return;
    onSave({
      code: code.trim(),
      course: name.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <form
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl text-gray-800"
        onClick={event => event.stopPropagation()}
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-course-title"
      >
        <h2
          id="edit-course-title"
          className="mb-1 text-lg font-bold text-[#2d5699]"
        >
          Editar ramo
        </h2>
        <p className="mb-4 text-xs text-gray-500">
          Completa el código y nombre. Recuerda guardar al salir del modo
          edición.
        </p>

        <label className="mb-3 block text-sm font-medium text-gray-700">
          Código
          <input
            type="text"
            value={code}
            onChange={event => setCode(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#2d5699] focus:ring-2 focus:ring-[#2d5699]/20"
            placeholder="Ej: ANT100"
            autoFocus
          />
        </label>

        <label className="mb-5 block text-sm font-medium text-gray-700">
          Nombre
          <input
            type="text"
            value={name}
            onChange={event => setName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#2d5699] focus:ring-2 focus:ring-[#2d5699]/20"
            placeholder="Ej: Antropología"
            required
          />
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="rounded-lg bg-[#2d5699] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#1e427a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aplicar
          </button>
        </div>
      </form>
    </div>
  );
};
