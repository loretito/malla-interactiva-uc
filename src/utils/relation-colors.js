export const PREREQ_COLOR = "#e67e22";
export const UNLOCK_COLOR = "#5dade2";

export const applyRelationColorVars = () => {
  const root = document.documentElement;
  root.style.setProperty("--relation-prereq", PREREQ_COLOR);
  root.style.setProperty("--relation-unlock", UNLOCK_COLOR);
};
