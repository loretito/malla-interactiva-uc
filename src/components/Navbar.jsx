import { useContext, useState } from "react";
import { CourseContext } from "../context/CourseContext";

export const Navbar = () => {
  const { title, setTitle } = useContext(CourseContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(open => !open);
  };

  return (
    <nav className="mb-2 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-[1360px] px-2 py-1 sm:px-1">
        <button
          type="button"
          onClick={toggleMenu}
          className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg text-left hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-hamburger"
          aria-expanded={isMenuOpen}
          aria-label="Abrir menú de mallas"
        >
          <span className="flex min-w-0 items-center gap-1 whitespace-nowrap text-2xl font-semibold dark:text-white">
            <span>Fonoaudiología UC:</span>
            <span>{title}</span>
          </span>

          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg p-2 text-sm text-gray-500 dark:text-gray-400">
            <svg
              className="h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </span>
        </button>

        <div
          className={`w-full ${isMenuOpen ? "block" : "hidden"}`}
          id="navbar-hamburger"
        >
          <ul className="mt-2 flex flex-col rounded-lg bg-gray-50 font-medium dark:border-gray-700 dark:bg-gray-800">
            <li>
              <div
                className="block cursor-pointer rounded py-2 pl-3 pr-4 text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={() => {
                  setTitle("Malla Nueva");
                  setIsMenuOpen(false);
                }}
              >
                Malla Nueva
              </div>
            </li>
            <li>
              <div
                className="block cursor-pointer rounded py-2 pl-3 pr-4 text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={() => {
                  setTitle("Malla Antigua");
                  setIsMenuOpen(false);
                }}
              >
                Malla Antigua
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
