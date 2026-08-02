const CC_TO_TYPE = {
  "bg-[#CCDFF6]": "fon",
  "bg-[#9BB8E6]": "electivos",
  "bg-[#80cbda]": "electivos",
  "bg-[#d2c5a6]": "electivos",
  "bg-[#71a2ed]": "electivos",
  "bg-[#21e6c1]": "mef",
  "bg-[#b9de51]": "bio",
  "bg-[#ffbd87]": "let",
  "bg-[#bfe3c0]": "psi",
  "bg-[#91b9ff]": "mat",
  "bg-[#ffea79]": "fis",
  "bg-[#7cf49a]": "qim",
  "bg-[#d09FFF]": "edu",
  "bg-[#ffcdab]": "vra",
  "bg-[#69d2cd]": "int",
  "bg-[#fdf4b0]": "def",
};

export const COURSE_TYPE_LABELS = {
  fon: "Fonoaudiología",
  electivos: "Electivos / Optativos",
  mef: "Ciencias de la salud",
  bio: "Biología",
  let: "Letras / Lingüística",
  psi: "Psicología",
  mat: "Matemáticas",
  fis: "Física / Filosofía",
  qim: "Química",
  edu: "Educación",
  vra: "Formación general UC",
  int: "Internados",
  def: "Proyecto / Defensa",
};

export const DEFAULT_TYPE_COLORS = {
  fon: "#CCDFF6",
  electivos: "#9BB8E6",
  mef: "#7EB6D9",
  bio: "#A8D4C4",
  let: "#F0C9A8",
  psi: "#C8D9B8",
  mat: "#91B9FF",
  fis: "#F2E4A8",
  qim: "#B8DDB0",
  edu: "#D2C4EE",
  vra: "#FFD8B8",
  int: "#69D2CD",
  def: "#F5E8A8",
};

export const TYPE_COLOR_PALETTE = [
  { id: "nube", hex: "#E8F1FB", label: "Nube" },
  { id: "cielo", hex: "#CCDFF6", label: "Cielo" },
  { id: "bruma", hex: "#C5DDF5", label: "Bruma" },
  { id: "celeste", hex: "#9BB8E6", label: "Celeste" },
  { id: "laguna", hex: "#8EC5E8", label: "Laguna" },
  { id: "agua", hex: "#7EB6D9", label: "Agua" },
  { id: "matiz", hex: "#91B9FF", label: "Matiz" },
  { id: "bahia", hex: "#6FA8D8", label: "Bahía" },
  { id: "rio", hex: "#5B8FC9", label: "Río" },
  { id: "marino", hex: "#4F7FB8", label: "Marino" },
  { id: "uc", hex: "#2D5699", label: "UC" },
  { id: "noche", hex: "#1E427A", label: "Noche" },
  { id: "menta", hex: "#69D2CD", label: "Menta" },
  { id: "turquesa", hex: "#7BCFC4", label: "Turquesa" },
  { id: "jade", hex: "#A8D4C4", label: "Jade" },
  { id: "musgo", hex: "#C8D9B8", label: "Musgo" },
  { id: "lima", hex: "#B8DDB0", label: "Lima" },
  { id: "arena", hex: "#F0C9A8", label: "Arena" },
  { id: "durazno", hex: "#FFD8B8", label: "Durazno" },
  { id: "arena-clara", hex: "#FFE4C8", label: "Arena clara" },
  { id: "trigo", hex: "#F5E8A8", label: "Trigo" },
  { id: "maiz", hex: "#F2E4A8", label: "Maíz" },
  { id: "lavanda", hex: "#D2C4EE", label: "Lavanda" },
  { id: "lila", hex: "#C4B5E8", label: "Lila" },
];

export const getCourseTypeKey = course => {
  const name = course?.course?.toLowerCase?.().trim?.() || "";

  if (name.includes("internado")) {
    return "int";
  }

  if (
    course?.labelEditable ||
    name === "formación teológica" ||
    name === "formación general" ||
    name === "electivo en otra disciplina" ||
    name === "optativo" ||
    name === "optativo de profundización"
  ) {
    return "electivos";
  }

  if (!course?.cc) {
    return "fon";
  }
  return CC_TO_TYPE[course.cc] || "fon";
};

export const getCourseTypeLabel = typeKey =>
  COURSE_TYPE_LABELS[typeKey] || typeKey;

export const getPaletteColor = hex =>
  TYPE_COLOR_PALETTE.find(
    color => color.hex.toUpperCase() === String(hex || "").toUpperCase()
  ) || null;

export const normalizeTypeColors = colors => {
  const next = { ...DEFAULT_TYPE_COLORS };
  if (!colors || typeof colors !== "object") {
    return next;
  }

  Object.keys(DEFAULT_TYPE_COLORS).forEach(typeKey => {
    const value = colors[typeKey];
    if (typeof value !== "string") {
      return;
    }
    const match = getPaletteColor(value);
    if (match) {
      next[typeKey] = match.hex;
    }
  });

  return next;
};

export const cloneTypeColors = colors => normalizeTypeColors(colors);

export const areTypeColorsEqual = (a, b) => {
  const left = normalizeTypeColors(a);
  const right = normalizeTypeColors(b);
  return Object.keys(DEFAULT_TYPE_COLORS).every(
    key => left[key] === right[key]
  );
};

export const getTypesInCourses = courses => {
  const seen = new Map();
  courses.forEach(course => {
    const key = getCourseTypeKey(course);
    if (!seen.has(key)) {
      seen.set(key, getCourseTypeLabel(key));
    }
  });

  return Object.keys(COURSE_TYPE_LABELS)
    .filter(key => seen.has(key))
    .map(key => ({ key, label: seen.get(key) }));
};

export const resolveCourseColor = (course, typeColors, showTypeColors) => {
  if (!showTypeColors) {
    const typeKey = getCourseTypeKey(course);
    if (typeKey === "electivos") {
      return DEFAULT_TYPE_COLORS.electivos;
    }
    if (course.cc === "bg-[#CCDFF6]") {
      return "#CCDFF6";
    }
    return "#F0F0F0";
  }

  const colors = normalizeTypeColors(typeColors);
  const typeKey = getCourseTypeKey(course);
  return colors[typeKey] || DEFAULT_TYPE_COLORS.fon;
};
