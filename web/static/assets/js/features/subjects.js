// =================== ADD/EDIT MODAL ===================
function openAddModal(id) {
  editingId = id;
  document.getElementById("addModalTitle").textContent = id
    ? "Chỉnh sửa môn học"
    : "Thêm môn học";
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
  } else {
    V("f_tenMon", "");
    V("f_tinChi", "3");
    V("f_tp1", "");
    V("f_tp2", "");
    V("f_diemThi", "");
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

  const raw = {
    id: editingId || uid(),
    tenMon: ten,
    tinChi: tin,
    tp1: parseFloat(G("f_tp1")) || 0,
    tp2: parseFloat(G("f_tp2")) || 0,
    diemThi: G("f_diemThi") !== "" ? parseFloat(G("f_diemThi")) : null,
  };
  const c = compute(raw);
  if (editingId) subjects = subjects.map((s) => (s.id === editingId ? c : s));
  else subjects.push(c);
  closeModal("addModal");
  saveState();
  renderAll();
}

async function deleteSubject(id) {
  const s = subjects.find((x) => x.id === id);
  if (!s) return;
  const confirmed = await showConfirm(`Xóa môn "<strong>${s.tenMon}</strong>"?`);
  if (!confirmed) return;
  subjects = subjects.filter((x) => x.id !== id);
  saveState();
  renderAll();
}

async function deleteAllSubjects() {
  if (subjects.length === 0) {
    showToast("Hiện không có dữ liệu nào để xóa!", "warning");
    return;
  }
  const confirmed = await showConfirm(
    "Bạn có chắc chắn muốn xóa TẤT CẢ môn học không?<br/>Hành động này không thể hoàn tác."
  );
  if (!confirmed) return;
  subjects = [];
  editingId = null;
  pasteRows = [];
  saveState();
  renderAll();
}
