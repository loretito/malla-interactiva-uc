import { resolveCourseColor } from "./course-type-colors";

const YEAR_BLUE = [45, 86, 153];
const SEM_BLUE = [50, 125, 219];
const GRAY = [75, 85, 99];
const WHITE = [255, 255, 255];
const TEXT = [30, 41, 59];
const MARK = [140, 30, 30];

const SEMESTER_ORDER = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
};

const hexToRgb = hex => {
  const value = String(hex || "#F0F0F0").replace("#", "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map(char => char + char)
          .join("")
      : value.padEnd(6, "0").slice(0, 6);
  return [
    parseInt(normalized.slice(0, 2), 16) || 0,
    parseInt(normalized.slice(2, 4), 16) || 0,
    parseInt(normalized.slice(4, 6), 16) || 0,
  ];
};

const buildColumns = coursesBySemesterAndYear => {
  const columns = [];
  Object.entries(coursesBySemesterAndYear)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .forEach(([year, bySemester]) => {
      Object.entries(bySemester)
        .sort(
          (a, b) =>
            (SEMESTER_ORDER[a[0]] || 99) - (SEMESTER_ORDER[b[0]] || 99)
        )
        .forEach(([semester, courses]) => {
          columns.push({
            year: String(year),
            semester: String(semester),
            courses: courses || [],
          });
        });
    });
  return columns;
};

const buildYearSpans = columns => {
  const spans = [];
  let index = 0;
  while (index < columns.length) {
    const year = columns[index].year;
    let span = 0;
    while (index + span < columns.length && columns[index + span].year === year) {
      span += 1;
    }
    spans.push({ year, start: index, span });
    index += span;
  }
  return spans;
};

const MM_PER_PT = 0.352777778;
const ptFromMm = mm => mm / MM_PER_PT;
const mmFromPt = pt => pt * MM_PER_PT;

const fitTitle = (pdf, text, maxWidth, maxSize, minSize) => {
  const value = String(text || "");
  pdf.setFont("helvetica", "normal");

  let size = maxSize;
  while (size >= minSize) {
    pdf.setFontSize(size);
    if (pdf.getTextWidth(value) <= maxWidth) {
      return { size, lines: [value] };
    }
    size -= 0.35;
  }

  size = maxSize * 0.92;
  while (size >= minSize) {
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(value, maxWidth);
    if (lines.length <= 2) {
      return { size, lines };
    }
    size -= 0.35;
  }

  size = maxSize * 0.8;
  while (size >= minSize) {
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(value, maxWidth);
    if (lines.length <= 3) {
      return { size, lines };
    }
    size -= 0.35;
  }

  pdf.setFontSize(minSize);
  return {
    size: minSize,
    lines: pdf.splitTextToSize(value, maxWidth).slice(0, 3),
  };
};

const drawCourseCard = (
  pdf,
  course,
  x,
  y,
  width,
  height,
  bodyColor,
  isMarked
) => {
  // Proporciones UI: header h-6, body h-12, footer ~h-6; badges h-4 en card w-32
  const radius = Math.min(2.2, width * 0.08);
  const headerH = height * 0.25;
  const footerH = height * 0.25;
  const bodyH = height - headerH - footerH;
  const bodyY = y + headerH;
  const footerY = y + headerH + bodyH;
  const pad = width * 0.04;
  const bodyRgb = hexToRgb(bodyColor);
  const chip = Math.min(headerH * 0.67, footerH * 0.67, width * 0.145);

  pdf.setFillColor(...GRAY);
  pdf.roundedRect(x, y, width, height, radius, radius, "F");
  pdf.setFillColor(...bodyRgb);
  pdf.rect(x, bodyY - 0.05, width, bodyH + 0.1, "F");

  const idSize = chip;
  const idX = x + width - pad - idSize;
  const idCenterY = y + headerH / 2;
  const codeMaxW = Math.max(4, idX - x - pad - 1);

  pdf.setTextColor(...WHITE);
  pdf.setFont("helvetica", "bold");
  let codeSize = ptFromMm(headerH * 0.48);
  pdf.setFontSize(codeSize);
  let code = String(course.code || "");
  while (codeSize > ptFromMm(headerH * 0.34) && pdf.getTextWidth(code) > codeMaxW) {
    codeSize -= 0.3;
    pdf.setFontSize(codeSize);
  }
  if (pdf.getTextWidth(code) > codeMaxW) {
    while (code.length > 3 && pdf.getTextWidth(`${code}…`) > codeMaxW) {
      code = code.slice(0, -1);
    }
    code = `${code}…`;
  }
  pdf.text(code, x + pad, idCenterY, { baseline: "middle" });

  pdf.setFillColor(...WHITE);
  pdf.circle(idX + idSize / 2, idCenterY, idSize / 2, "F");
  pdf.setTextColor(...TEXT);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(ptFromMm(idSize * 0.72));
  pdf.text(String(course.id), idX + idSize / 2, idCenterY, {
    align: "center",
    baseline: "middle",
  });

  const titleMaxW = width - pad * 2.4;
  const { size: titleSize, lines } = fitTitle(
    pdf,
    course.course,
    titleMaxW,
    ptFromMm(bodyH * 0.22),
    ptFromMm(bodyH * 0.14)
  );
  const lineH = mmFromPt(titleSize) * 1.2;
  const blockH = lines.length * lineH;
  let titleY = bodyY + (bodyH - blockH) / 2 + lineH * 0.78;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(titleSize);
  pdf.setTextColor(...TEXT);
  lines.forEach(line => {
    pdf.text(line, x + width / 2, titleY, { align: "center" });
    titleY += lineH;
  });

  const badge = chip;
  const crBox = chip;
  const hasCredits = course.cr != null && course.cr !== "";
  const rightReserve = hasCredits ? crBox + pad + 0.6 : pad;
  let reqX = x + pad;
  const reqCenterY = footerY + footerH / 2;
  const reqs = Array.isArray(course.req) ? course.req : [];
  const chipFont = ptFromMm(chip * 0.72);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(chipFont);
  reqs.forEach(req => {
    if (reqX + badge > x + width - rightReserve) {
      return;
    }
    pdf.setFillColor(...bodyRgb);
    pdf.setDrawColor(110, 110, 110);
    pdf.setLineWidth(0.18);
    pdf.circle(reqX + badge / 2, reqCenterY, badge / 2, "FD");
    pdf.setTextColor(...TEXT);
    pdf.text(String(req.id), reqX + badge / 2, reqCenterY, {
      align: "center",
      baseline: "middle",
    });
    reqX += badge + width * 0.02;
  });

  if (hasCredits) {
    const crX = x + width - pad - crBox;
    const crY = footerY + (footerH - crBox) / 2;
    pdf.setFillColor(...WHITE);
    pdf.roundedRect(crX, crY, crBox, crBox, 0.35, 0.35, "F");
    pdf.setTextColor(...TEXT);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(chipFont);
    pdf.text(String(course.cr), crX + crBox / 2, crY + crBox / 2, {
      align: "center",
      baseline: "middle",
    });
  }

  if (isMarked) {
    pdf.setDrawColor(...MARK);
    pdf.setLineWidth(0.8);
    pdf.line(x + 1.4, y + height * 0.3, x + width - 1.4, y + height * 0.78);
  }
};

export const exportMallaPdf = async ({
  title,
  coursesBySemesterAndYear,
  finishedCourses = [],
  activeTypeColors,
  showTypeColors = false,
  includeMarkedCourses = false,
  mallaTitle,
}) => {
  const { jsPDF } = await import("jspdf");
  const columns = buildColumns(coursesBySemesterAndYear);
  if (!columns.length) {
    throw new Error("No hay cursos para exportar");
  }

  const colCount = columns.length;
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a2",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 10;
  const marginTop = 16;
  const marginBottom = 8;
  const usableWidth = pageWidth - marginX * 2;
  const usableHeight = pageHeight - marginTop - marginBottom;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(ptFromMm(6));
  pdf.setTextColor(...YEAR_BLUE);
  pdf.text(`Fonoaudiología UC — ${title}`, marginX, 11);

  const colGap = 2.8;
  const colWidth = (usableWidth - colGap * (colCount - 1)) / colCount;
  const yearHeaderH = 11;
  const semHeaderH = 9;
  const cardGap = 2.2;
  const headerGap = 1.8;
  const maxCards = Math.max(...columns.map(column => column.courses.length), 1);
  const cardsAreaH = usableHeight - yearHeaderH - semHeaderH - headerGap * 2;
  const cardHeight = (cardsAreaH - cardGap * (maxCards - 1)) / maxCards;
  const offsetY = marginTop;

  const yearSpans = buildYearSpans(columns);
  const finishedSet = new Set(finishedCourses);

  yearSpans.forEach(span => {
    const x = marginX + span.start * (colWidth + colGap);
    const width = span.span * colWidth + (span.span - 1) * colGap;
    pdf.setFillColor(...YEAR_BLUE);
    pdf.roundedRect(x, offsetY, width, yearHeaderH, 1, 1, "F");
    pdf.setTextColor(...WHITE);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(ptFromMm(yearHeaderH * 0.55));
    pdf.text(`Año ${span.year}`, x + width / 2, offsetY + yearHeaderH / 2, {
      align: "center",
      baseline: "middle",
    });
  });

  columns.forEach((column, index) => {
    const x = marginX + index * (colWidth + colGap);
    const semY = offsetY + yearHeaderH + headerGap;
    pdf.setFillColor(...SEM_BLUE);
    pdf.roundedRect(x, semY, colWidth, semHeaderH, 1.2, 1.2, "F");
    pdf.setTextColor(...WHITE);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(ptFromMm(semHeaderH * 0.55));
    pdf.text(column.semester, x + colWidth / 2, semY + semHeaderH / 2, {
      align: "center",
      baseline: "middle",
    });

    column.courses.forEach((course, courseIndex) => {
      const y =
        semY + semHeaderH + headerGap + courseIndex * (cardHeight + cardGap);
      drawCourseCard(
        pdf,
        course,
        x,
        y,
        colWidth,
        cardHeight,
        resolveCourseColor(
          course,
          activeTypeColors,
          showTypeColors,
          mallaTitle || title
        ),
        includeMarkedCourses && finishedSet.has(course.id)
      );
    });
  });

  const safeTitle = String(title || "malla")
    .toLowerCase()
    .replace(/\s+/g, "-");
  pdf.save(`malla-${safeTitle}.pdf`);
};
