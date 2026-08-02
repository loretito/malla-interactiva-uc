const MALLA_NUEVA = "Malla Nueva";
const MALLA_ANTIGUA = "Malla Antigua";

const COLOR1_CODES_BY_MALLA = {
  [MALLA_NUEVA]: new Set([
    "MAT1000",
    "FIS122F",
    "FON208A",
    "BIO141C",
    "BIO135F",
    "MEF102A",
    "MEF105A",
    "PSI1101",
    "LET011F",
  ]),
  [MALLA_ANTIGUA]: new Set([
    "MAT1023",
    "QIM201F",
    "BIO141C",
    "MEF101A",
    "FON101",
    "PSI1101",
    "FON102",
  ]),
};

const COLOR2_CODES_BY_MALLA = {
  [MALLA_NUEVA]: new Set([
    "MEF205A",
    "MEF201B",
    "FON101A",
    "LET012F",
    "LET015F",
    "LET013F",
    "FON204A",
    "FON207A",
    "FON203A",
  ]),
  [MALLA_ANTIGUA]: new Set([
    "MEF103A",
    "BIO135F",
    "FIS121F",
    "FON205A",
    "MEF201A",
    "MEF203B",
    "LET003F",
    "FON301",
  ]),
};

export const COURSE_TYPE_LABELS = {
  color1: "Formación básica",
  color2: "Licenciatura",
  fon: "Fonoaudiología",
  electivos: "Electivos / Optativos",
  int: "Internados",
  def: "Proyecto / Defensa",
};

export const DEFAULT_TYPE_COLORS = {
  color1: "#E8D9A8",
  color2: "#A8D4C4",
  fon: "#CCDFF6",
  electivos: "#9BB8E6",
  int: "#7BCFC4",
  def: "#F0E4B8",
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
  { id: "arena", hex: "#E8D9A8", label: "Arena" },
  { id: "arena-suave", hex: "#F0C9A8", label: "Arena suave" },
  { id: "durazno", hex: "#FFD8B8", label: "Durazno" },
  { id: "durazno-claro", hex: "#F0D2B8", label: "Durazno claro" },
  { id: "arena-clara", hex: "#FFE4C8", label: "Arena clara" },
  { id: "trigo", hex: "#F0E4B8", label: "Trigo" },
  { id: "trigo-claro", hex: "#F5E8A8", label: "Trigo claro" },
  { id: "maiz", hex: "#F2E4A8", label: "Maíz" },
  { id: "lavanda", hex: "#D2C4EE", label: "Lavanda" },
  { id: "lila", hex: "#C4B5E8", label: "Lila" },
];

const normalizeCode = code => String(code || "").trim().toUpperCase();

export const getCourseTypeKey = (course, mallaTitle) => {
  const name = course?.course?.toLowerCase?.().trim?.() || "";
  const code = normalizeCode(course?.code);

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

  if (name.includes("defensa") || name.includes("proyecto de título")) {
    return "def";
  }

  if (COLOR1_CODES_BY_MALLA[mallaTitle]?.has(code)) {
    return "color1";
  }

  if (COLOR2_CODES_BY_MALLA[mallaTitle]?.has(code)) {
    return "color2";
  }

  return "fon";
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

export const getTypesInCourses = (courses, mallaTitle) => {
  const seen = new Map();
  courses.forEach(course => {
    const key = getCourseTypeKey(course, mallaTitle);
    if (!seen.has(key)) {
      seen.set(key, getCourseTypeLabel(key));
    }
  });

  return Object.keys(COURSE_TYPE_LABELS)
    .filter(key => seen.has(key))
    .map(key => ({ key, label: seen.get(key) }));
};

export const resolveCourseColor = (
  course,
  typeColors,
  showTypeColors,
  mallaTitle
) => {
  if (!showTypeColors) {
    const typeKey = getCourseTypeKey(course, mallaTitle);
    if (typeKey === "electivos") {
      return DEFAULT_TYPE_COLORS.electivos;
    }
    if (course.cc === "bg-[#CCDFF6]") {
      return "#CCDFF6";
    }
    return "#F0F0F0";
  }

  const colors = normalizeTypeColors(typeColors);
  const typeKey = getCourseTypeKey(course, mallaTitle);
  return colors[typeKey] || DEFAULT_TYPE_COLORS.fon;
};
