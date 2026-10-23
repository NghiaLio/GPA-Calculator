function editScaleModalTemplate() {
  return `<!-- =================== MODAL: EDIT SCALE =================== -->
    <div
      id="editScaleModal"
      class="overlay hidden"
      onclick="overlayClose(event, 'editScaleModal')"
    >
      <div class="modal modal-wide" style="max-width: 700px;">
        <div class="modal-hd">
          <span class="modal-title">✏️ Chỉnh sửa Thang điểm & Công thức</span>
          <button class="modal-close" onclick="closeModal('editScaleModal')">
            ✕
          </button>
        </div>
        <div class="modal-body">
          <h3 style="margin-top:0; color: var(--primary);">1. Chỉnh sửa Công thức tính</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Trọng số TP1</label>
              <input type="number" id="es_tp1" step="0.1" value="0.7">
            </div>
            <div class="form-group">
              <label class="form-label">Trọng số TP2</label>
              <input type="number" id="es_tp2" step="0.1" value="0.3">
            </div>
            <div class="form-group">
              <label class="form-label">Trọng số ĐQT</label>
              <input type="number" id="es_dqt" step="0.1" value="0.3">
            </div>
            <div class="form-group">
              <label class="form-label">Trọng số Điểm Thi</label>
              <input type="number" id="es_thi" step="0.1" value="0.7">
            </div>
          </div>
          
          <h3 style="color: var(--primary); margin-top: 15px;">2. Chỉnh sửa Thang điểm</h3>
          <p style="font-size: 13px; color: #666; margin-bottom: 10px;">Sắp xếp mốc điểm 10 từ cao xuống thấp. Dòng cuối cùng (F) phải bắt đầu từ 0.</p>
          <div style="max-height: 400px; overflow: auto; border: 1px solid var(--gray-200); border-radius: 8px;">
            <table class="scale-tbl" style="margin-bottom: 0;">
              <thead>
                <tr>
                  <th style="white-space: nowrap">Min (Thang 10)</th>
                  <th style="white-space: nowrap">Thang 4</th>
                  <th style="white-space: nowrap">Điểm chữ</th>
                  <th style="white-space: nowrap">Xếp loại</th>
                  <th style="width: 40px"></th>
                </tr>
              </thead>
              <tbody id="editScaleTbody">
                <!-- rendered via JS -->
              </tbody>
            </table>
          </div>
            <button class="btn btn-outline btn-sm" style="margin-top: 10px;" onclick="addScaleRow()">➕ Thêm mốc điểm</button>
            <button class="btn btn-outline btn-sm" style="margin-top: 10px; color: var(--red-600); border-color: var(--red-300)" onclick="resetDefaultSettings()">Khôi phục Mặc định</button>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('editScaleModal')">
            Hủy
          </button>
          <button class="btn btn-primary" onclick="saveScaleSettings()">
            💾 Lưu cấu hình
          </button>
        </div>
      </div>
    </div>`;
}

let tempGrades = [];

function openEditScaleModal() {
  document.getElementById("es_tp1").value = currentWeights.tp1;
  document.getElementById("es_tp2").value = currentWeights.tp2;
  document.getElementById("es_dqt").value = currentWeights.dqt;
  document.getElementById("es_thi").value = currentWeights.thi;
  
  // Clone to temp array
  tempGrades = JSON.parse(JSON.stringify(currentGrades));
  renderEditScaleTbody();
  
  closeModal('scaleModal'); // close the view modal
  document.getElementById("editScaleModal").classList.remove("hidden");
}

function renderEditScaleTbody() {
  const tbody = document.getElementById("editScaleTbody");
  if (!tbody) return;
  
  let html = "";
  for (let i = 0; i < tempGrades.length; i++) {
    const g = tempGrades[i];
    html += `
      <tr>
        <td><input type="number" class="scale-input" style="width: 70px" step="0.1" value="${g.min}" onchange="updateScaleRow(${i}, 'min', this.value)" ${i === tempGrades.length - 1 ? "disabled" : ""}></td>
        <td><input type="number" class="scale-input" style="width: 70px" step="0.1" value="${g.s4}" onchange="updateScaleRow(${i}, 's4', this.value)"></td>
        <td><input type="text" class="scale-input" style="width: 60px" value="${g.letter}" onchange="updateScaleRow(${i}, 'letter', this.value)"></td>
        <td><input type="text" class="scale-input" value="${g.rank}" onchange="updateScaleRow(${i}, 'rank', this.value)"></td>
        <td style="text-align:center">
          ${i < tempGrades.length - 1 ? `<button class="modal-close" style="font-size:16px; color:var(--red-500)" onclick="removeScaleRow(${i})">✕</button>` : ""}
        </td>
      </tr>
    `;
  }
  tbody.innerHTML = html;
}

function updateScaleRow(index, key, val) {
  if (key === 'min' || key === 's4') {
    tempGrades[index][key] = parseFloat(val) || 0;
  } else {
    tempGrades[index][key] = val;
  }
}

function addScaleRow() {
  // Insert before the last row (F)
  const newRow = { min: 5.0, s4: 2.0, letter: "New", rank: "Mới" };
  tempGrades.splice(tempGrades.length - 1, 0, newRow);
  tempGrades.sort((a, b) => b.min - a.min); // Ensure sorted high to low
  renderEditScaleTbody();
}

function removeScaleRow(index) {
  tempGrades.splice(index, 1);
  renderEditScaleTbody();
}

async function resetDefaultSettings() {
  const confirmed = await showConfirm("Bạn có chắc chắn muốn khôi phục về cấu hình mặc định?");
  if (!confirmed) return;
  tempGrades = JSON.parse(JSON.stringify(DEFAULT_GRADES));
  document.getElementById("es_tp1").value = DEFAULT_WEIGHTS.tp1;
  document.getElementById("es_tp2").value = DEFAULT_WEIGHTS.tp2;
  document.getElementById("es_dqt").value = DEFAULT_WEIGHTS.dqt;
  document.getElementById("es_thi").value = DEFAULT_WEIGHTS.thi;
  renderEditScaleTbody();
}

function saveScaleSettings() {
  const w = {
    tp1: parseFloat(document.getElementById("es_tp1").value) || 0,
    tp2: parseFloat(document.getElementById("es_tp2").value) || 0,
    dqt: parseFloat(document.getElementById("es_dqt").value) || 0,
    thi: parseFloat(document.getElementById("es_thi").value) || 0,
  };
  
  // Sort grades high to low, ensure last is 0
  tempGrades.sort((a, b) => b.min - a.min);
  if (tempGrades[tempGrades.length - 1].min !== 0) {
    tempGrades[tempGrades.length - 1].min = 0;
  }

  pushHistory("Cập nhật thang điểm & công thức");
  saveSettings(tempGrades, w);
  
  // Recompute all subjects with new settings
  subjects = subjects.map(s => compute(s));
  saveState();
  renderAll(); // Rerender main table
  
  closeModal('editScaleModal');
  
  // Reopen scale modal to show changes
  renderScaleModalUI();
  document.getElementById("scaleModal").classList.remove("hidden");
  
  showToast("Lưu cấu hình thành công!", "success");
}
