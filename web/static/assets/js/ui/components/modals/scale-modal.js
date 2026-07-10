function scaleModalTemplate() {
  return `<!-- =================== MODAL: SCALE =================== -->
    <div
      id="scaleModal"
      class="overlay hidden"
      onclick="overlayClose(event, 'scaleModal')"
    >
      <div class="modal modal-scale">
        <div class="modal-hd">
          <span class="modal-title">📋 Thang điểm quy đổi</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn-outline btn-sm" onclick="openEditScaleModal()">
              ✏️ Chỉnh sửa
            </button>
            <button class="modal-close" onclick="closeModal('scaleModal')">
              ✕
            </button>
          </div>
        </div>
        <div class="modal-body">
          <div style="overflow-x: auto;">
            <table class="scale-tbl">
              <thead>
                <tr>
                  <th style="white-space: nowrap">Thang 10</th>
                  <th style="white-space: nowrap">Thang 4</th>
                  <th style="white-space: nowrap">Điểm chữ</th>
                  <th style="white-space: nowrap">Xếp loại</th>
                </tr>
              </thead>
              <tbody id="scaleModalTbody">
              </tbody>
            </table>
          </div>
          <div class="scale-note" id="scaleModalNote">
          </div>
        </div>
      </div>
    </div>`;
}

function renderScaleModalUI() {
  const tbody = document.getElementById("scaleModalTbody");
  const note = document.getElementById("scaleModalNote");
  if (!tbody || !note) return;

  let html = "";
  for (let i = 0; i < currentGrades.length; i++) {
    const g = currentGrades[i];
    const prevMin = i === 0 ? "10.0" : currentGrades[i - 1].min.toFixed(1);
    const range = i === 0 ? `${g.min.toFixed(1)} – 10.0` : `${g.min.toFixed(1)} – ${(currentGrades[i - 1].min - 0.1).toFixed(1)}`;
    
    let colorClass = "scale-row-green";
    let badgeClass = "grade-a";
    let rankClass = "rank-a";
    if (g.letter.startsWith("B")) { colorClass = "scale-row-blue"; badgeClass = "grade-b"; rankClass = "rank-b"; }
    else if (g.letter.startsWith("C")) { colorClass = "scale-row-amber"; badgeClass = "grade-c"; rankClass = "rank-c"; }
    else if (g.letter.startsWith("D")) { colorClass = "scale-row-orange"; badgeClass = "grade-d"; rankClass = "rank-d"; }
    else if (g.letter === "F") { colorClass = "scale-row-red"; badgeClass = "grade-f"; rankClass = "rank-f"; }

    html += `
      <tr class="scale-row ${colorClass}">
        <td>${i === currentGrades.length - 1 ? `0.0 – ${(currentGrades[i - 1].min - 0.1).toFixed(1)}` : range}</td>
        <td>${g.s4.toFixed(1)}</td>
        <td>
          <span class="letter-badge ${badgeClass}">${g.letter}</span>
        </td>
        <td class="${rankClass}">${g.rank}</td>
      </tr>
    `;
  }
  tbody.innerHTML = html;

  note.innerHTML = `
    📐 <strong>Công thức tính:</strong><br />
    &nbsp;&nbsp;ĐQT = TP1 × ${currentWeights.tp1} + TP2 × ${currentWeights.tp2}<br />
    &nbsp;&nbsp;Điểm HP = ĐQT × ${currentWeights.dqt} + Điểm thi × ${currentWeights.thi}<br /><br />
    📊 <strong>Công thức GPA:</strong> A = Σ(điểm_4 × tín_chỉ) / Σtín_chỉ<br />
    &nbsp;&nbsp;Chỉ tính môn đạt điểm chữ A, B, C hoặc D (không tính F)
  `;
}
