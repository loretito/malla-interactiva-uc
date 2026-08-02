import { useEffect } from "react";

export const ConfirmResetModal = ({ open, title, onConfirm, onClose }) => {
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

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl text-gray-800"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-reset-title"
      >
        <h2
          id="confirm-reset-title"
          className="mb-3 text-lg font-bold text-[#2d5699]"
        >
          Volver a default — {title}
        </h2>

        <p className="mb-2 text-sm leading-relaxed text-gray-700">
          Se restablecerán solo los cambios editables de esta malla:
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>Los Internados volverán al orden por defecto</li>
          <li>
            Los nombres y códigos de optativos / formación general se borrarán
          </li>
        </ul>
        <p className="mb-5 text-sm font-medium text-amber-800">
          Los cursos terminados y créditos no se modifican. Solo afecta a{" "}
          {title}.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Restablecer
          </button>
        </div>
      </div>
    </div>
  );
};
