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

// =================== MÔN HỌC LẠI / CẢI THIỆN ===================
// Trong một nhóm các môn trùng tên mà có ít nhất một lần được đánh dấu "học lại",
// chỉ lần có điểm cao nhất được tính vào GPA. Các lần còn lại bị "thay thế".
function getSupersededSet(list) {
  const groups = new Map();
  list.forEach((s) => {
    const k = normalizeText(s.tenMon);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(s);
  });

  const superseded = new Set();
  groups.forEach((arr) => {
    if (arr.length < 2 || !arr.some((s) => s.hocLai)) return;
    // Môn chưa có điểm (s4 null) luôn thấp hơn môn đã có điểm, kể cả điểm F
    const score = (s) => (s.s4 ?? -1) * 1000 + (s.diemHP ?? -1);
    let best = arr[0];
    arr.forEach((s) => {
      if (score(s) > score(best)) best = s;
    });
    arr.forEach((s) => {
      if (s !== best) superseded.add(s);
    });
  });
  return superseded;
}

function getEffectiveSubjects(list) {
  const superseded = getSupersededSet(list);
  return superseded.size ? list.filter((s) => !superseded.has(s)) : list;
}

function calcGPA(list) {
  const eff = getEffectiveSubjects(list);
  const valid = eff.filter(
    (s) => s.diemChu && s.diemChu !== "F" && parseFloat(s.tinChi) > 0,
  );
  const totalTc = eff.reduce((a, s) => a + (parseFloat(s.tinChi) || 0), 0);
  const passTc = valid.reduce((a, s) => a + parseFloat(s.tinChi), 0);
  const failTc = eff
    .filter((s) => s.diemChu === "F")
    .reduce((a, s) => a + parseFloat(s.tinChi || 0), 0);
  if (!passTc)
    return {
      gpa: "—",
      gpaNum: null,
      rank: "—",
      totalTc,
      passTc: 0,
      points: 0,
      failTc,
      n: list.length,
    };
  const points = valid.reduce((a, s) => a + s.s4 * parseFloat(s.tinChi), 0);
  const g = points / passTc;
  const gpaDisplay = Number(fmtRounded(g, 2));
  let rank = "Yếu";
  if (gpaDisplay >= 3.6) rank = "Xuất sắc";
  else if (gpaDisplay >= 3.2) rank = "Giỏi";
  else if (gpaDisplay >= 2.5) rank = "Khá";
  else if (gpaDisplay >= 2.0) rank = "Trung bình";
  return {
    gpa: fmtRounded(g, 2),
    gpaNum: g,
    rank,
    totalTc,
    passTc,
    points,
    failTc,
    n: list.length,
  };
}

// =================== NHÓM THEO HỌC KỲ ===================
function semesterLabel(namHoc, hocKy) {
  const y = String(namHoc || "").trim();
  const k = String(hocKy || "").trim();
  if (!y && !k) return "Chưa phân kỳ";
  const kLabel = !k ? "" : /^\d+$/.test(k) ? `Học kỳ ${k}` : k === "Hè" ? "Học kỳ hè" : k;
  return [kLabel, y ? `Năm học ${y}` : ""].filter(Boolean).join(" · ");
}

function semesterShortLabel(namHoc, hocKy) {
  const y = String(namHoc || "").trim();
  const k = String(hocKy || "").trim();
  const kShort = !k ? "" : /^\d+$/.test(k) ? `HK${k}` : k === "Hè" ? "Hè" : k;
  // 2024-2025 -> 24-25
  const yShort = y.replace(/(\d{2})(\d{2})-(\d{2})(\d{2})/, "$2-$4");
  return [kShort, yShort].filter(Boolean).join(" ") || "—";
}

function semesterKey(s) {
  return `${String(s.namHoc || "").trim()}|${String(s.hocKy || "").trim()}`;
}

// Trả về các nhóm đã sắp xếp theo thời gian; nhóm "chưa phân kỳ" luôn ở cuối.
function getSemesterGroups(list) {
  const map = new Map();
  list.forEach((s) => {
    const k = semesterKey(s);
    if (!map.has(k)) {
      map.set(k, {
        key: k,
        namHoc: String(s.namHoc || "").trim(),
        hocKy: String(s.hocKy || "").trim(),
        items: [],
      });
    }
    map.get(k).items.push(s);
  });

  const groups = [...map.values()];
  groups.forEach((g) => {
    g.unassigned = !g.namHoc && !g.hocKy;
    g.label = semesterLabel(g.namHoc, g.hocKy);
    g.shortLabel = semesterShortLabel(g.namHoc, g.hocKy);
  });

  const kOrder = (k) => (k === "Hè" ? 3 : parseInt(k, 10) || 0);
  groups.sort((a, b) => {
    if (a.unassigned !== b.unassigned) return a.unassigned ? 1 : -1;
    if (a.namHoc !== b.namHoc) return a.namHoc < b.namHoc ? -1 : 1;
    return kOrder(a.hocKy) - kOrder(b.hocKy);
  });

  // GPA từng kỳ và GPA tích lũy tính đến hết kỳ đó
  let acc = [];
  groups.forEach((g) => {
    acc = acc.concat(g.items);
    g.stats = calcGPA(g.items);
    g.cumulative = calcGPA(acc);
  });
  return groups;
}
