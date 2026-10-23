// =================== ADD/EDIT MODAL ===================
// Đảm bảo <select> có option cho giá trị cũ (VD: học kỳ nhập từ Excel là "3", "HK1"...)
function setSelectValue(id, val) {
  const el = document.getElementById(id);
  const v = String(val ?? "");
  if (v && ![...el.options].some((o) => o.value === v)) {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    el.appendChild(opt);
  }
  el.value = v;
}

function fillNamHocSuggestions() {
  const list = document.getElementById("namHocList");
  if (!list || list.children.length) return;
  const y = new Date().getFullYear();
  for (let i = y + 1; i >= y - 7; i--) {
    const opt = document.createElement("option");
    opt.value = `${i - 1}-${i}`;
    list.appendChild(opt);
  }
}

function openAddModal(id) {
  editingId = id;
  document.getElementById("addModalTitle").textContent = id
    ? "Chỉnh sửa môn học"
    : "Thêm môn học";
  fillNamHocSuggestions();
  if (id) {
    const s = subjects.find((x) => x.id === id);
    if (!s) return;
    V("f_tenMon", s.tenMon || "");
    V("f_tinChi", s.tinChi || "3");
    V("f_tp1", s.tp1 ?? "");
    V("f_tp2", s.tp2 ?? "");
    V(
      "f_diemThi",
      s.diemThi !== null && s.diemThi !== undefined ? s.diemThi : "",
    );
    setSelectValue("f_hocKy", s.hocKy);
    V("f_namHoc", s.namHoc || "");
    document.getElementById("f_hocLai").checked = !!s.hocLai;
  } else {
    V("f_tenMon", "");
    V("f_tinChi", "3");
    V("f_tp1", "");
    V("f_tp2", "");
    V("f_diemThi", "");
    // Gợi ý theo kỳ vừa nhập gần nhất để thêm nhiều môn cùng kỳ nhanh hơn
    const prefs = getPrefs();
    setSelectValue("f_hocKy", prefs.lastHocKy);
    V("f_namHoc", prefs.lastNamHoc || "");
    document.getElementById("f_hocLai").checked = false;
  }
  updatePreview();
  document.getElementById("addModal").classList.remove("hidden");
  setTimeout(() => document.getElementById("f_tenMon").focus(), 100);
}

function V(id, val) {
  document.getElementById(id).value = val;
}
function G(id) {
  return document.getElementById(id).value.trim();
}

function updatePreview() {
  const tp1 = parseFloat(G("f_tp1")) || 0;
  const tp2 = parseFloat(G("f_tp2")) || 0;
  const thiV = G("f_diemThi");
  const dqt = +(tp1 * 0.7 + tp2 * 0.3).toFixed(2);
  const hasThi = thiV !== "";
  const hp = hasThi
    ? +(dqt * 0.3 + (parseFloat(thiV) || 0) * 0.7).toFixed(2)
    : null;
  const hpDisplay = hp !== null ? Number(fmtRounded(hp, 1)) : null;
  const g = hpDisplay !== null ? gradeOf(hpDisplay) : null;
  const c = hp !== null ? sColor(hp) : "#d1d5db";

  document.getElementById("pv_dqt").textContent = fmtRounded(dqt, 1);
  document.getElementById("pv_dqt").style.color = sColor(dqt);
  document.getElementById("pv_hp").textContent =
    hp !== null ? fmtRounded(hp, 1) : "—";
  document.getElementById("pv_hp").style.color = c;
  document.getElementById("pv_letter").textContent = g ? g.letter : "—";
  document.getElementById("pv_letter").style.color = g
    ? lColor(g.letter)
    : "#d1d5db";
  document.getElementById("pv_s4").textContent = g ? g.s4 : "—";
  document.getElementById("pv_s4").style.color = g
    ? lColor(g.letter)
    : "#d1d5db";
}

function saveSubject() {
  const ten = G("f_tenMon");
  if (!ten) {
    showToast("Vui lòng nhập tên môn học!", "warning");
    return;
  }
  const tin = parseFloat(G("f_tinChi"));
  if (isNaN(tin) || tin <= 0) {
    showToast("Vui lòng nhập số tín chỉ hợp lệ!", "warning");
    return;
  }

  const namHoc = G("f_namHoc");
  const oldNamHoc = editingId
    ? (subjects.find((s) => s.id === editingId)?.namHoc || "")
    : "";
  if (namHoc && namHoc !== oldNamHoc && !/^\d{4}-\d{4}$/.test(namHoc)) {
    showToast("Năm học nên có dạng 2024-2025", "warning");
    return;
  }
  const hocKy = G("f_hocKy");

  const raw = {
    id: editingId || uid(),
    tenMon: ten,
    tinChi: tin,
    tp1: parseFloat(G("f_tp1")) || 0,
    tp2: parseFloat(G("f_tp2")) || 0,
    diemThi: G("f_diemThi") !== "" ? parseFloat(G("f_diemThi")) : null,
    namHoc,
    hocKy,
    hocLai: document.getElementById("f_hocLai").checked,
  };
  const c = compute(raw);
  pushHistory(`${editingId ? "Sửa" : "Thêm"} môn ${ten}`);
  if (editingId) subjects = subjects.map((s) => (s.id === editingId ? c : s));
  else subjects.push(c);
  setPref("lastNamHoc", namHoc);
  setPref("lastHocKy", hocKy);
  closeModal("addModal");
  saveState();
  renderAll();
}

async function deleteSubject(id) {
  const s = subjects.find((x) => x.id === id);
  if (!s) return;
  const confirmed = await showConfirm(`Xóa môn "<strong>${esc(s.tenMon)}</strong>"?`);
  if (!confirmed) return;
  pushHistory(`Xóa môn ${s.tenMon}`);
  subjects = subjects.filter((x) => x.id !== id);
  saveState();
  renderAll();
  showToast(`Đã xóa môn ${esc(s.tenMon)}`, "info", {
    action: { label: "Hoàn tác", onClick: undo },
    duration: 6000,
  });
}

async function deleteAllSubjects() {
  if (subjects.length === 0) {
    showToast("Hiện không có dữ liệu nào để xóa!", "warning");
    return;
  }
  const confirmed = await showConfirm(
    "Bạn có chắc chắn muốn xóa TẤT CẢ môn học không?<br/>Bạn vẫn có thể hoàn tác ngay sau đó (Ctrl+Z)."
  );
  if (!confirmed) return;
  pushHistory(`Xóa tất cả ${subjects.length} môn học`);
  subjects = [];
  editingId = null;
  pasteRows = [];
  saveState();
  renderAll();
  showToast("Đã xóa tất cả môn học", "info", {
    action: { label: "Hoàn tác", onClick: undo },
    duration: 8000,
  });
}
