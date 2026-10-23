// =================== UNDO / REDO & HISTORY ===================
// Lưu ảnh chụp (snapshot) trạng thái trước mỗi thay đổi để có thể hoàn tác.
const HISTORY_LIMIT = 40;
let undoStack = [];
let redoStack = [];

function cloneData(v) {
  return JSON.parse(JSON.stringify(v));
}

function snapshotState() {
  return {
    subjects: cloneData(subjects),
    grades: cloneData(currentGrades),
    weights: cloneData(currentWeights),
  };
}

// Gọi TRƯỚC khi thay đổi dữ liệu.
function pushHistory(label) {
  undoStack.push({ label, time: Date.now(), snap: snapshotState() });
  if (undoStack.length > HISTORY_LIMIT) undoStack.shift();
  redoStack = [];
  updateHistoryButtons();
}

function clearHistory() {
  undoStack = [];
  redoStack = [];
  updateHistoryButtons();
}

function applySnapshot(snap) {
  subjects = cloneData(snap.subjects);
  currentGrades = cloneData(snap.grades);
  currentWeights = cloneData(snap.weights);
  _id = Math.max(0, ...subjects.map((s) => Number(s.id) || 0)) + 1;

  sessionStorage.setItem("app_grades", JSON.stringify(currentGrades));
  sessionStorage.setItem("app_weights", JSON.stringify(currentWeights));

  saveState(); // đồng bộ lại lên đám mây
  if (typeof renderScaleModalUI === "function") renderScaleModalUI();
  renderAll();
}

// Lùi 1 bước nhưng chưa áp dụng ra giao diện; trả về snapshot cần khôi phục
function stepBack() {
  const entry = undoStack.pop();
  redoStack.push({ label: entry.label, time: Date.now(), snap: snapshotState() });
  return entry;
}

function undo() {
  if (!undoStack.length) {
    showToast("Không còn thao tác nào để hoàn tác", "warning");
    return;
  }
  const entry = stepBack();
  applySnapshot(entry.snap);
  showToast(`↩️ Đã hoàn tác: ${esc(entry.label)}`, "info");
}

function redo() {
  if (!redoStack.length) {
    showToast("Không còn thao tác nào để làm lại", "warning");
    return;
  }
  const entry = redoStack.pop();
  undoStack.push({ label: entry.label, time: Date.now(), snap: snapshotState() });
  applySnapshot(entry.snap);
  showToast(`↪️ Đã làm lại: ${esc(entry.label)}`, "info");
}

// Quay về trạng thái ngay trước thao tác thứ `index` trong undoStack
function undoTo(index) {
  if (index < 0 || index >= undoStack.length) return;
  let snap = null;
  while (undoStack.length > index) snap = stepBack().snap;
  applySnapshot(snap);
  showToast("↩️ Đã khôi phục trạng thái trước đó", "info");
}

function updateHistoryButtons() {
  const u = document.getElementById("btnUndo");
  const r = document.getElementById("btnRedo");
  if (u) {
    u.disabled = !undoStack.length;
    u.title = undoStack.length
      ? `Hoàn tác: ${undoStack[undoStack.length - 1].label} (Ctrl+Z)`
      : "Không có gì để hoàn tác (Ctrl+Z)";
  }
  if (r) {
    r.disabled = !redoStack.length;
    r.title = redoStack.length
      ? `Làm lại: ${redoStack[redoStack.length - 1].label} (Ctrl+Y)`
      : "Không có gì để làm lại (Ctrl+Y)";
  }
  if (typeof refreshHistoryTab === "function") refreshHistoryTab();
}

// Phím tắt bàn phím cho hoàn tác / làm lại
document.addEventListener("keydown", (e) => {
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;

  if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z") && !e.shiftKey) {
    e.preventDefault();
    undo();
  } else if (
    (e.ctrlKey || e.metaKey) &&
    (e.key === "y" || e.key === "Y" || ((e.key === "z" || e.key === "Z") && e.shiftKey))
  ) {
    e.preventDefault();
    redo();
  }
});
