import { useEffect } from "react";

const ItemIcon = ({ done = false, pending = false }) => (
  <span
    className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none text-white ${
      done ? "bg-emerald-600" : pending ? "bg-amber-400" : "bg-gray-400"
    }`}
    aria-hidden="true"
  >
    ✓
  </span>
);

const ListItem = ({
  children,
  done = false,
  pending = false,
  nested = false,
}) => (
  <li className={`flex items-center gap-2 ${nested ? "pl-6" : ""}`}>
    <ItemIcon done={done} pending={pending} />
    <span
      className={`leading-snug ${pending ? "text-amber-700" : ""}`}
    >
      {children}
    </span>
  </li>
);

export const WhatsNewModal = ({ open, onClose }) => {
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
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl text-gray-800 text-center"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2
            id="whats-new-title"
            className="flex-1 text-xl font-bold text-[#2d5699] text-center"
          >
            Novedades
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <p className="mb-3 text-sm leading-relaxed text-left">
          Hola les habla la creadora de la página desde un lugar lejano y
          secreto.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-left">
          La página revivió porque estoy aburrida, se vienen nuevas cositas:
        </p>

        <ul className="mb-4 inline-flex flex-col items-start space-y-2 text-left text-sm">
          <ListItem done>Ver prerrequisitos</ListItem>
          <ListItem done>Modo edición, el cual permite:</ListItem>
          <ListItem nested done>Visualizar ramos por tipo</ListItem>
          <ListItem nested done>
            Editar ramos optativos y opcionales para rellenarlos con el nombre
          </ListItem>
          <ListItem nested done>
            Ordenar los Internados a preferencia
          </ListItem>
          <ListItem>Modo oscuro</ListItem>
          <ListItem done>Obtener malla en PDF</ListItem>
        </ul>

        <p className="mb-4 text-sm italic text-gray-600">
          Fecha de término: de aquí a infinito jaja {"<3"}
        </p>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#2d5699] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e427a]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
