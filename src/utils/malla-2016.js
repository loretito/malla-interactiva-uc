import { VRA, MAT, ELE, TEO, ELP, FIS, QIM, BIO, EDU, PSI, LET, INT,DEF,FON,MEF } from "./colors";

export const ramos2016 = [
  {
    id: 1,
    code: "MAT1023",
    course: "Cálculo",
    semester: 'I',
    year: 1,
    cc: MAT,
    cr: 10,
    req: [],
  },
  {
    id: 2,
    code: "QIM201F",
    course: "Química",
    semester: 'I',
    year: 1,
    cc: QIM,
    cr: 10,
    req: [],
  },
  {
    id: 3,
    code: "BIO141C",
    course: "Biología de la Célula",
    semester: 'I',
    year: 1,
    cc: BIO,
    cr: 10,
    req: [],
  },
  {
    id: 4,
    code: "MEF101A",
    course: "Introducción a la Anatomía",
    semester: 'I',
    year: 1,
    cc: MEF,
    cr: 5,
    req: [],
  },
  {
    id: 5,
    code: "FON101",
    course: "Introducción a la Fonoaudilogía",
    semester: 'I',
    year: 1,
    cc: FON,
    cr: 5,
    req: [],
  },

  {
    id: 6,
    code: "PSI1101",
    course: "Procesos Psicológicos Básicos",
    semester: 'I',
    year: 1,
    cc: PSI,
    cr: 10,
    req: [],
  },

  {
    id: 7,
    code: "VRA100C",
    course: "Examen de Comunicación Escrita",
    semester: 'I',
    year: 1,
    cc: VRA,
    req: [],
  },

  {
    id: 8,
    code: "VRA2000",
    course: "English Test",
    semester: 'I',
    year: 1,
    cc: VRA,
    req: [],
  },
  {
    id: 9,
    code: "FIS121F",
    course: "Física para Fonoaudiología",
    semester: 'II',
    year: 1,
    cc: FIS,
    cr: 10,
    req: [],
  },
  {
    id: 10,
    code: "BIO135F",
    course: "Fisiología",
    semester: 'II',
    year: 1,
    cc: BIO,
    cr: 10,
    req: [
      { id: 3, cc: BIO },
      { id: 4, cc: MEF },
    ],
  },
  {
    id: 11,
    code: "MEF103A",
    course: "Bioestadística",
    semester: 'II',
    year: 1,
    cc: MEF,
    cr: 10,
    req: [{ id: 1, cc: MAT }],
  },
  {
    id: 12,
    code: "FON102",
    course: "Anatomía de Cabeza, Cuello y Neuroanatomía",
    semester: 'II',
    year: 1,
    cc: FON,
    cr: 10,
    req: [{ id: 4, cc: MEF }],
  },
  {
    id: 13,
    course: "Electivo en otra Disciplina",
    semester: 'II',
    year: 1,
    cc: ELE,
    cr: 10,
    req: [],
  },
  {
    id: 14,
    code: "FON205A",
    course: "Salud Pública para Fonoaudiología",
    semester: 'III',
    year: 2,
    cc: FON,
    cr: 5,
    req: [{ id: 11, cc: MEF }],
  },
  {
    id: 15,
    code: "MEF201A",
    course: "Fisiopatología",
    semester: 'III',
    year: 2,
    cc: MEF,
    cr: 10,
    req: [{ id: 10, cc: BIO }],
  },
  {
    id: 16,
    code: "LET002F",
    course: "Morfosintaxis del Español",
    semester: 'III',
    year: 2,
    cc: LET,
    cr: 10,
    req: [],
  },
  {
    id: 17,
    code: "EDU0012",
    course: "Psicolinguística Evolutiva",
    semester: 'III',
    year: 2,
    cc: EDU,
    cr: 5,
    req: [
      { id: 5, cc: FON },
      { id: 6, cc: PSI },
    ],
  },
  {
    id: 18,
    code: "LET003F",
    course: "Fonética, Fonología y Fonoaudiología",
    semester: 'III',
    year: 2,
    cc: LET,
    cr: 10,
    req: [{ id: 9, cc: FIS }],
  },
  {
    id: 19,
    course: "Formación Teológica",
    semester: 'III',
    year: 2,
    cc: TEO,
    cr: 10,
    req: [],
  },
  {
    id: 20,
    code: "FON201",
    course: "Audiología",
    semester: 'IV',
    year: 2,
    cc: FON,
    cr: 5,
    req: [
      { id: 9, cc: FIS },
      { id: 12, cc: FON },
    ],
  },
  {
    id: 21,
    code: "MEF203B",
    course: "Farmacología para Fonoaudiología",
    semester: 'IV',
    year: 2,
    cc: MEF,
    cr: 5,
    req: [{ id: 2, cc: QIM }],
  },
  {
    id: 22,
    code: "LET005F",
    course: "Semántica y Pragmática",
    semester: 'IV',
    year: 2,
    cc: LET,
    cr: 5,
    req: [],
  },
  {
    id: 23,
    code: "MEF204A",
    course: "Alteraciones del Sistema Nervioso en Niños y Adolescentes",
    semester: 'IV',
    year: 2,
    cc: MEF,
    cr: 10,
    req: [{ id: 12, cc: FON }],
  },
  {
    id: 24,
    code: "FON202",
    course: "Motricidad Orofacial",
    semester: 'IV',
    year: 2,
    cc: FON,
    cr: 5,
    req: [
      { id: 12, cc: FON },
      { id: 18, cc: LET },
    ],
  },
  {
    id: 25,
    course: "Electivo en otra Disciplina",
    semester: 'IV',
    year: 2,
    cc: ELE,
    cr: 10,
    req: [],
  },
  {
    id: 26,
    course: "Electivo en otra Disciplina",
    semester: 'IV',
    year: 2,
    cc: ELE,
    cr: 10,
    req: [],
  },
  {
    id: 27,
    code: "FON301",
    course: "Evaluación Audiológica",
    semester: 'V',
    year: 3,
    cc: FON,
    cr: 10,
    req: [{ id: 20, cc: FON }],
  },
  {
    id: 28,
    code: "FON302",
    course: "Patología Fonoaudiológica",
    semester: 'V',
    year: 3,
    cc: FON,
    cr: 10,
    req: [{ id: 15, cc: MEF }],
  },
  {
    id: 29,
    code: "PSI2500",
    course: "Neuropsicología Del Lenguage",
    semester: 'V',
    year: 3,
    cc: PSI,
    cr: 10,
    req: [{ id: 17, cc: EDU }],
  },
  {
    id: 30,
    code: "MEF301A",
    course: "Alteraciones del Sistema Nervioso en Adultos",
    semester: 'V',
    year: 3,
    cc: MEF,
    cr: 10,
    req: [{ id: 12, cc: FON }],
  },
  {
    id: 31,
    code: "MEF302B",
    course: "Ética para Ciencias de la Salud",
    semester: 'V',
    year: 3,
    cc: MEF,
    cr: 10,
    req: [],
  },
  {
    id: 32,
    code: "FON303",
    course: "Eufonía",
    semester: 'VI',
    year: 3,
    cc: FON,
    cr: 5,
    req: [],
  },
  {
    id: 33,
    code: "FON304",
    course:
      "Evaluación de los Trastornos de la Comunicación en Niños y Adolescentes",
    semester: 'VI',
    year: 3,
    cc: FON,
    cr: 10,
    req: [
      { id: 23, cc: MEF },
      { id: 24, cc: FON },
      { id: 29, cc: PSI },
    ],
  },
  {
    id: 34,
    code: "FON305",
    course: "Intervención Audiológica",
    semester: 'VI',
    year: 3,
    cc: FON,
    cr: 10,
    req: [{ id: 27, cc: FON }],
  },
  {
    id: 35,
    code: "EDU0013",
    course: "Fonoaudiología en Educación",
    semester: 'VI',
    year: 3,
    cc: EDU,
    cr: 5,
    req: [{ id: 17, cc: EDU }],
  },
  {
    id: 36,
    course: "Optativo de Profundización",
    semester: 'VI',
    year: 3,
    cc: ELP,
    cr: 10,
    req: [],
  },
  {
    id: 37,
    course: "Electivo en otra Disciplina",
    semester: 'VI',
    year: 3,
    cc: ELE,
    cr: 10,
    req: [],
  },
  {
    id: 38,
    code: "FON401",
    course: "Evaluacion y Procedimientos en Voz",
    semester: 'VII',
    year: 4,
    cc: FON,
    cr: 5,
    req: [
      { id: 28, cc: FON },
      { id: 32, cc: FON }
    ],
  },
  {
    id: 39,
    code: "FON402",
    course: "Trastornos de la Deglución",
    semester: 'VII',
    year: 4,
    cc: FON,
    cr: 5,
    req: [
      { id: 23, cc: MEF },
      { id: 28, cc: FON },
      { id: 30, cc: MEF },
    ],
  },
  {
    id: 40,
    code: "FON403",
    course: "Evaluación de la comunicación en Adultos",
    semester: 'VII',
    year: 4,
    cc: FON,
    cr: 10,
    req: [
      { id: 28, cc: FON },
      { id: 30, cc: MEF },
    ],
  },
  {
    id: 41,
    code: "FON406",
    course: "Intervención en la Comunicación de Niños y Adolescentes",
    semester: 'VII',
    year: 4,
    cc: FON,
    cr: 10,
    req: [{ id: 33, cc: FON }],
  },
  {
    id: 42,
    course: "Optativo de Profundización",
    semester: 'VII',
    year: 4,
    cr: 10,
    cc: ELP,
    req: [],
  },
  {
    id: 43,
    course: "Electivo en otra Disciplina",
    semester: 'VII',
    year: 4,
    cc: ELE,
    cr: 10,
    req: [],
  },
  {
    id: 44,
    code: "FON404",
    course: "Intervención En Voz",
    semester: 'VIII',
    year: 4,
    cc: FON,
    cr: 10,
    req: [{ id: 38, cc: FON }],
  },
  {
    id: 45,
    code: "FON405",
    course: "Investigación Fonoaudiológica",
    semester: 'VIII',
    year: 4,
    cc: FON,
    cr: 10,
    req: [
      { id: 14, cc: FON },
      { id: 34, cc: FON },
      { id: 38, cc: FON },
      { id: 39, cc: FON },
      { id: 40, cc: FON },
      { id: 41, cc: FON },
    ],
  },
  {
    id: 46,
    code: "PSI2501",
    course: "Tecnologías de Comunicación Alternativa y Aumentativa",
    semester: 'VIII',
    year: 4,
    cc: PSI,
    cr: 10,
    req: [
      { id: 17, cc: PSI },
      { id: 34, cc: FON },
      { id: 41, cc: FON },
    ],
  },
  {
    id: 47,
    code: "FON407",
    course: "Intervención Fonoaudiológica en Adultos",
    semester: 'VIII',
    year: 4,
    cc: FON,
    cr: 10,
    req: [{ id: 40, cc: FON }],
  },
  {
    id: 48,
    course: "Electivo en otra Disciplina",
    semester: 'VIII',
    year: 4,
    cc: ELE,
    cr: 10,
    req: [],
  },
  {
    id: 49,
    course: "Defensa Proyecto de Investigación",
    semester: 'VIII',
    year: 4,
    cc: DEF,
    req: [],
  },
  {
    id: 50,
    code: "FON501",
    course: "Internado: Educación",
    semester: 'IX',
    year: 5,
    cc: INT,
    cr: 17,
    req: [],
    rc: 400,

    minCr: 400,
  },
  {
    id: 51,
    code: "FON502",
    course: "Internado: Clínico Adultos",
    semester: 'IX',
    year: 5,
    cc: INT,
    cr: 17,
    req: [],
    rc: 400,

    minCr: 400,
  },
  {
    id: 52,
    code: "FON503",
    course: "Internado: Clínico Pediátrico",
    semester: 'IX',
    year: 5,
    cc: INT,
    cr: 17,
    req: [],
    rc: 400,

    minCr: 400,
  },
  {
    id: 53,
    code: "FON504",
    course: "Internado: Voz",
    semester: 'X',
    year: 5,
    cc: INT,
    cr: 17,
    req: [],
    rc: 400,

  },
  {
    id: 54,
    code: "FON506",
    course: "Internado: Audición",
    semester: 'X',
    year: 5,
    cc: INT,
    cr: 17,
    req: [],
    rc: 400,
  },
  {
    id: 55,
    code: "FON507",
    course: "Internado Electivo",
    semester: 'X',
    year: 5,
    cc: INT,
    cr: 15,
    req: [],
    rc: 400,
  },
];
