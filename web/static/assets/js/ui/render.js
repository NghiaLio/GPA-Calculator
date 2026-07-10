// =================== RENDER ===================
function renderAll() {
  const list = getProcessedSubjects();
  document.getElementById("countLabel").textContent =
    `TỔNG SỐ: ${list.length} MÔN HỌC`;
  renderStats(list);
  renderTable(list);
  
  // Tự động lưu trạng thái khi có bất kỳ thay đổi nào khiến render lại
  if (typeof saveState === "function") {
    saveState();
  }
}

function renderStats(list) {
  const st = calcGPA(list);
  const rk =
    st.rank !== "—"
      ? `<span style="font-size:12px;font-weight:700;color:${rankColor(st.rank)}">${st.rank}</span>`
      : "";
  document.getElementById("statsBar").innerHTML = `
    <div class="stat-item">
      <div class="stat-label">GPA Tích lũy (Thang 4)</div>
      <div class="stat-value">${st.gpa}</div>
      <div class="stat-sub">${rk}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Tổng tín chỉ</div>
      <div class="stat-value gray">${st.totalTc}</div>
      <div class="stat-sub">tín chỉ</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Tín chỉ đạt</div>
      <div class="stat-value green">${st.passTc}</div>
      <div class="stat-sub">qua môn</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Tín chỉ nợ</div>
      <div class="stat-value" style="color:${st.failTc > 0 ? "#dc2626" : "#9ca3af"}">${st.failTc}</div>
      <div class="stat-sub">điểm F</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Số môn học</div>
      <div class="stat-value gray">${st.n}</div>
      <div class="stat-sub">môn học</div>
    </div>
  `;
}

function renderTable(list) {
  if (!list.length) {
    document.getElementById("mainContent").innerHTML = `
      <div class="empty">
        <div class="empty-icon">📚</div>
        <p>Chưa có dữ liệu môn học.</p>
        <div class="hint">Hãy thêm môn học thủ công hoặc nhập từ Excel / dán dữ liệu.</div>
      </div>`;
    return;
  }

  const rows = list
    .map((s, i) => {
      const hasThi = s.diemThi !== null && s.diemThi !== undefined;
      return `<tr>
      <td class="center" style="color:#d1d5db;font-size:12px">${i + 1}</td>
      <td><span class="subject-name">${esc(s.tenMon)}</span></td>
      <td class="center"><span class="tc-badge">${s.tinChi}</span></td>
      <td class="center"><span class="score" style="color:${sColor(s.tp1)}">${fmt(s.tp1)}</span></td>
      <td class="center"><span class="score" style="color:${sColor(s.tp2)}">${fmt(s.tp2)}</span></td>
      <td class="center"><span class="score" style="color:${sColor(s.dqt)}">${fmt(s.dqt)}</span></td>
      <td class="center">${hasThi ? `<span class="score" style="color:${sColor(s.diemThi)}">${fmt(s.diemThi)}</span>` : `<span class="score-dash">Chưa thi</span>`}</td>
      <td class="center">${s.diemHP !== null ? `<span class="score" style="color:${sColor(s.diemHP)}">${fmt(s.diemHP)}</span>` : `<span class="score-dash">—</span>`}</td>
      <td class="center">${s.diemChu ? `<span class="letter-badge" style="color:${lColor(s.diemChu)};background:${lBg(s.diemChu)}">${s.diemChu}</span>` : `<span class="score-dash">—</span>`}</td>
      <td class="center">
        <div class="row-actions">
          <button class="icon-btn edit" onclick="openAddModal(${s.id})" title="Chỉnh sửa">✏️</button>
          <button class="icon-btn del" onclick="deleteSubject(${s.id})" title="Xóa">🗑️</button>
        </div>
      </td>
    </tr>`;
    })
    .join("");

  document.getElementById("mainContent").innerHTML = `
    <div class="semester-card">
      <table class="tbl">
        <thead><tr>
          <th class="center" style="width:36px">#</th>
          <th>Môn học</th>
          <th class="center">Tín chỉ</th>
          <th class="center" title="Điểm giữa kỳ">GK (TP1)</th>
          <th class="center" title="Điểm chuyên cần">CC (TP2)</th>
          <th class="center" title="Điểm quá trình = TP1×0.7 + TP2×0.3">ĐQT</th>
          <th class="center" title="Điểm thi cuối kỳ">Điểm thi</th>
          <th class="center" title="Điểm học phần = ĐQT×0.3 + Điểm thi×0.7">Điểm HP</th>
          <th class="center">Điểm chữ</th>
          <th class="center" style="width:72px">Thao tác</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}
