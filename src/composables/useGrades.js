import { ref, computed, watch } from 'vue';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

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

// Global reactive states
const subjects = ref([]);
const currentGrades = ref([...DEFAULT_GRADES]);
const currentWeights = ref({ ...DEFAULT_WEIGHTS });

const searchQuery = ref("");
const sortMode = ref("default"); // default, name_asc, name_desc, hp_desc, hp_asc, tc_desc
let unsubscribeFirestore = null;
let saveDebounceTimer = null;

export function parseScore(v) {
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

export function fmtRounded(num, precision = 2) {
  if (num === null || num === undefined || isNaN(num)) return "—";
  return Number(num).toFixed(precision);
}

export function useGrades() {
  // Load state from sessionStorage
  const loadLocalState = () => {
    const savedSubjects = sessionStorage.getItem("app_subjects");
    if (savedSubjects) {
      try { subjects.value = JSON.parse(savedSubjects); } catch (e) {}
    }
    const savedGrades = sessionStorage.getItem("app_grades");
    if (savedGrades) {
      try { currentGrades.value = JSON.parse(savedGrades); } catch (e) {}
    }
    const savedWeights = sessionStorage.getItem("app_weights");
    if (savedWeights) {
      try { currentWeights.value = JSON.parse(savedWeights); } catch (e) {}
    }
  };

  const saveLocalState = () => {
    sessionStorage.setItem("app_subjects", JSON.stringify(subjects.value));
    sessionStorage.setItem("app_grades", JSON.stringify(currentGrades.value));
    sessionStorage.setItem("app_weights", JSON.stringify(currentWeights.value));
  };

  const gradeOf = (score) => {
    const s = parseFloat(score);
    if (isNaN(s) || s < 0) return currentGrades.value[currentGrades.value.length - 1];
    for (const g of currentGrades.value) {
      if (s >= g.min) return g;
    }
    return currentGrades.value[currentGrades.value.length - 1];
  };

  // Compute computed properties for a single subject
  const computeSubject = (r) => {
    const tp1 = parseScore(r.tp1) ?? 0;
    const tp2 = parseScore(r.tp2) ?? 0;
    const thi = parseScore(r.diemThi);
    const dqt = +(tp1 * currentWeights.value.tp1 + tp2 * currentWeights.value.tp2).toFixed(2);
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
    const hp = +(dqt * currentWeights.value.dqt + thi * currentWeights.value.thi).toFixed(2);
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
  };

  // Computed list of processed subjects with computeSubject applied
  const processedSubjects = computed(() => {
    return subjects.value.map(s => computeSubject(s));
  });

  // Filtered & Sorted subjects
  const filteredSubjects = computed(() => {
    let list = processedSubjects.value;

    const q = searchQuery.value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (q !== "") {
      list = list.filter(s => {
        const name = (s.tenMon || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return name.includes(q);
      });
    }

    if (sortMode.value !== "default") {
      list = [...list].sort((a, b) => {
        if (sortMode.value === "name_asc") {
          return (a.tenMon || "").localeCompare(b.tenMon || "");
        }
        if (sortMode.value === "name_desc") {
          return (b.tenMon || "").localeCompare(a.tenMon || "");
        }
        if (sortMode.value === "tc_desc") {
          return (parseFloat(b.tinChi) || 0) - (parseFloat(a.tinChi) || 0);
        }
        if (sortMode.value === "hp_desc") {
          return (b.diemHP ?? -1) - (a.diemHP ?? -1);
        }
        if (sortMode.value === "hp_asc") {
          return (a.diemHP ?? -1) - (b.diemHP ?? -1);
        }
        return 0;
      });
    }

    return list;
  });

  // Dashboard Statistics Computation
  const stats = computed(() => {
    const list = processedSubjects.value;
    const valid = list.filter(
      (s) => s.diemChu && s.diemChu !== "F" && parseFloat(s.tinChi) > 0
    );
    const totalTc = list.reduce((a, s) => a + (parseFloat(s.tinChi) || 0), 0);
    const passTc = valid.reduce((a, s) => a + parseFloat(s.tinChi), 0);
    const failTc = list
      .filter((s) => s.diemChu === "F")
      .reduce((a, s) => a + parseFloat(s.tinChi || 0), 0);

    if (!passTc) {
      return { gpa4: "—", gpa10: "—", rank: "—", totalTc, passTc: 0, failTc, count: list.length };
    }

    const g4 = valid.reduce((a, s) => a + s.s4 * parseFloat(s.tinChi), 0) / passTc;
    const g10 = valid.reduce((a, s) => a + s.diemHP * parseFloat(s.tinChi), 0) / passTc;

    const gpa4Display = Number(fmtRounded(g4, 2));
    let rank = "Yếu";
    if (gpa4Display >= 3.6) rank = "Xuất sắc";
    else if (gpa4Display >= 3.2) rank = "Giỏi";
    else if (gpa4Display >= 2.5) rank = "Khá";
    else if (gpa4Display >= 2.0) rank = "Trung bình";

    return {
      gpa4: fmtRounded(g4, 2),
      gpa10: fmtRounded(g10, 2),
      rank,
      totalTc,
      passTc,
      failTc,
      count: list.length
    };
  });

  // Direct Firestore Sync
  const syncToCloud = (currentUser) => {
    if (!currentUser) return;
    if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(userRef, {
          data: {
            subjects: subjects.value,
            weights: currentWeights.value,
            scale: currentGrades.value
          }
        }, { merge: true });
      } catch (err) {
        console.error("Lỗi đồng bộ Cloud Firestore:", err);
      }
    }, 800);
  };

  const subscribeCloudData = (currentUser, onLoadedCallback) => {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    unsubscribeFirestore = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data()?.data) {
        const cloudData = docSnap.data().data;
        if (cloudData.subjects) subjects.value = cloudData.subjects;
        if (cloudData.weights) currentWeights.value = cloudData.weights;
        if (cloudData.scale) currentGrades.value = cloudData.scale;
        saveLocalState();
        if (onLoadedCallback) onLoadedCallback();
      }
    }, (err) => {
      console.error("Lỗi ngắt kết nối Firestore listener:", err);
    });
  };

  const unsubscribeCloudData = () => {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }
  };

  // State Mutators
  const addSubject = (subj) => {
    const maxId = subjects.value.length > 0 ? Math.max(...subjects.value.map(s => s.id || 0)) : 0;
    subjects.value.push({ ...subj, id: maxId + 1 });
    saveLocalState();
  };

  const updateSubject = (id, subj) => {
    const idx = subjects.value.findIndex(s => s.id === id);
    if (idx !== -1) {
      subjects.value[idx] = { ...subj, id };
      saveLocalState();
    }
  };

  const deleteSubject = (id) => {
    subjects.value = subjects.value.filter(s => s.id !== id);
    saveLocalState();
  };

  const clearAllSubjects = () => {
    subjects.value = [];
    saveLocalState();
  };

  const setScaleAndWeights = (newGrades, newWeights) => {
    currentGrades.value = newGrades;
    currentWeights.value = newWeights;
    saveLocalState();
  };

  return {
    subjects,
    currentGrades,
    currentWeights,
    searchQuery,
    sortMode,
    processedSubjects,
    filteredSubjects,
    stats,
    loadLocalState,
    saveLocalState,
    addSubject,
    updateSubject,
    deleteSubject,
    clearAllSubjects,
    setScaleAndWeights,
    syncToCloud,
    subscribeCloudData,
    unsubscribeCloudData,
    DEFAULT_GRADES,
    DEFAULT_WEIGHTS
  };
}
