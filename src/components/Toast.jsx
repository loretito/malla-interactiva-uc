import { useEffect } from "react";

export const Toast = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div
      className="toast-animated fixed bottom-5 left-1/2 z-[60] flex max-w-[90vw] items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
      role="status"
      aria-live="polite"
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold"
        aria-hidden="true"
      >
        ✓
      </span>
      <span>{message}</span>
    </div>
  );
};
