// =================== GRADE ENGINE ===================
const DEFAULT_GRADES = [
  { min: 9.0, s4: 4.0, letter: "A+", rank: "Xuất sắc" },
  { min: 8.5, s4: 3.8, letter: "A", rank: "Giỏi" },
  { min: 7.8, s4: 3.5, letter: "B+", rank: "Khá" },
  { min: 7.0, s4: 3.0, letter: "B", rank: "Khá" },
  { min: 6.3, s4: 2.4, letter: "C+", rank: "Trung bình" },
  { min: 5.5, s4: 2.0, letter: "C", rank: "Trung bình" },
  { min: 4.8, s4: 1.5, letter: "D+", rank: "Trung bình yếu" },
  { min: 4.0, s4: 1.0, letter: "D", rank: "Trung bình yếu" },
  { min: 0.0, s4: 0.0, letter: "F", rank: "Kém" },
];

const DEFAULT_WEIGHTS = {
  tp1: 0.7,
  tp2: 0.3,
  dqt: 0.3,
  thi: 0.7,
};

let currentGrades = [...DEFAULT_GRADES];
let currentWeights = { ...DEFAULT_WEIGHTS };

function loadSettings() {
  const savedGrades = sessionStorage.getItem("app_grades");
  if (savedGrades) {
    try { currentGrades = JSON.parse(savedGrades); } catch (e) {}
  }
  const savedWeights = sessionStorage.getItem("app_weights");
  if (savedWeights) {
    try { currentWeights = JSON.parse(savedWeights); } catch (e) {}
  }
}

function saveSettings(grades, weights) {
  currentGrades = grades;
  currentWeights = weights;
  sessionStorage.setItem("app_grades", JSON.stringify(grades));
  sessionStorage.setItem("app_weights", JSON.stringify(weights));
  
  if (typeof saveState === "function") {
    saveState();
  }
}

loadSettings();

function gradeOf(score) {
  const s = parseFloat(score);
  if (isNaN(s) || s < 0) return currentGrades[currentGrades.length - 1];
  for (const g of currentGrades) if (s >= g.min) return g;
  return currentGrades[currentGrades.length - 1];
}

function parseScore(v) {
  if (
    v === null ||
    v === undefined ||
    v === "" ||
    v === ".." ||
    v === "..." ||
    v === "–" ||
    v === "-"
  )
    return null;
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? null : n;
}

function compute(r) {
  const tp1 = parseScore(r.tp1) ?? 0;
  const tp2 = parseScore(r.tp2) ?? 0;
  const thi = parseScore(r.diemThi);
  const dqt = +(tp1 * currentWeights.tp1 + tp2 * currentWeights.tp2).toFixed(2);
  if (thi === null) {
    return {
      ...r,
      tp1,
      tp2,
      dqt,
      diemHP: null,
      diemChu: null,
      s4: null,
      rank: null,
    };
  }
  const hp = +(dqt * currentWeights.dqt + thi * currentWeights.thi).toFixed(2);
  const hpDisplay = Number(fmtRounded(hp, 1));
  const g = gradeOf(hpDisplay);
  return {
    ...r,
    tp1,
    tp2,
    dqt,
    diemHP: hp,
    diemChu: g.letter,
    s4: g.s4,
    rank: g.rank,
  };
}

function calcGPA(list) {
  const valid = list.filter(
    (s) => s.diemChu && s.diemChu !== "F" && parseFloat(s.tinChi) > 0,
  );
  const totalTc = list.reduce((a, s) => a + (parseFloat(s.tinChi) || 0), 0);
  const passTc = valid.reduce((a, s) => a + parseFloat(s.tinChi), 0);
  const failTc = list
    .filter((s) => s.diemChu === "F")
    .reduce((a, s) => a + parseFloat(s.tinChi || 0), 0);
  if (!passTc)
    return { gpa: "—", rank: "—", totalTc, passTc: 0, failTc, n: list.length };
  const g = valid.reduce((a, s) => a + s.s4 * parseFloat(s.tinChi), 0) / passTc;
  const gpaDisplay = Number(fmtRounded(g, 2));
  let rank = "Yếu";
  if (gpaDisplay >= 3.6) rank = "Xuất sắc";
  else if (gpaDisplay >= 3.2) rank = "Giỏi";
  else if (gpaDisplay >= 2.5) rank = "Khá";
  else if (gpaDisplay >= 2.0) rank = "Trung bình";
  return {
    gpa: fmtRounded(g, 2),
    rank,
    totalTc,
    passTc,
    failTc,
    n: list.length,
  };
}
