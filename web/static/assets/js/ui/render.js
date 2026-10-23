// =================== RENDER ===================
function renderAll() {
  const list = getProcessedSubjects();
  document.getElementById("countLabel").textContent =
    `TỔNG SỐ: ${list.length} MÔN HỌC`;
  renderStats(subjects, list);
  renderAlerts();
  renderTable(list);
  if (typeof renderInsights === "function") renderInsights();
  syncToolbarState();
}

// Đồng bộ trạng thái các nút bật/tắt và hoàn tác trên thanh công cụ
function syncToolbarState() {
  const prefs = getPrefs();
  const g = document.getElementById("btnGroupSemester");
  if (g) g.classList.toggle("is-active", !!prefs.groupBySemester);
  const i = document.getElementById("btnInsights");
  if (i) i.classList.toggle("is-active", !!prefs.showInsights);
  if (typeof updateHistoryButtons === "function") updateHistoryButtons();
}

function toggleGroupBySemester() {
  setPref("groupBySemester", !getPrefs().groupBySemester);
  renderAll();
}

function renderStats(allSubjects, visibleSubjects) {
  const st = calcGPA(allSubjects || subjects);
  const displayCount = visibleSubjects ? visibleSubjects.length : st.n;
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
      <div class="stat-value gray">${displayCount}</div>
      <div class="stat-sub">môn học</div>
    </div>
  `;
}

// Banner cảnh báo học vụ / tiến độ (chỉ hiện mức cần chú ý, mức "info" xem trong Công cụ)
function renderAlerts() {
  const el = document.getElementById("alertBar");
  if (!el) return;
  const alerts = computeAlerts().filter((a) => a.level !== "info");
  el.innerHTML = alerts
    .map(
      (a) => `<div class="alert alert-${a.level}" role="alert">
        <span class="alert-icon">${a.icon}</span>
        <div><strong>${a.title}</strong><div>${a.text}</div></div>
      </div>`,
    )
    .join("");
  el.classList.toggle("hidden", alerts.length === 0);
}

// ---------- Bảng điểm ----------
function emptyStateHtml() {
  return `
      <div class="empty">
        <div class="empty-icon">📚</div>
        <p>Chưa có dữ liệu môn học.</p>
        <div class="hint">Hãy thêm môn học thủ công hoặc nhập từ Excel / dán dữ liệu.</div>
      </div>`;
}

function subjectRowHtml(s, i, superseded, showSemester) {
  const hasThi = s.diemThi !== null && s.diemThi !== undefined;
  const isSuperseded = superseded.has(s);
  const hasSemester = s.namHoc || s.hocKy;
  const tags =
    (s.hocLai
      ? `<span class="tag tag-retake" title="Môn học lại / cải thiện">🔁 Học lại</span>`
      : "") +
    (isSuperseded
      ? `<span class="tag tag-muted" title="Đã có lần điểm cao hơn nên không tính vào GPA">Không tính GPA</span>`
      : "");
  const sub =
    showSemester && hasSemester
      ? `<div class="subject-sub">${esc(semesterShortLabel(s.namHoc, s.hocKy))}</div>`
      : "";
  return `<tr class="${isSuperseded ? "row-superseded" : ""}">
      <td class="center" style="color:#d1d5db;font-size:12px">${i + 1}</td>
      <td><span class="subject-name">${esc(s.tenMon)}</span>${tags}${sub}</td>
      <td class="center"><span class="tc-badge">${s.tinChi}</span></td>
      <td class="center"><span class="score" style="color:${sColor(s.tp1)}">${fmt(s.tp1)}</span></td>
      <td class="center"><span class="score" style="color:${sColor(s.tp2)}">${fmt(s.tp2)}</span></td>
      <td class="center"><span class="score" style="color:${sColor(s.dqt)}">${fmt(s.dqt)}</span></td>
      <td class="center">${hasThi ? `<span class="score" style="color:${sColor(s.diemThi)}">${fmt(s.diemThi)}</span>` : `<span class="score-dash">Chưa thi</span>`}</td>
      <td class="center">${s.diemHP !== null ? `<span class="score" style="color:${sColor(s.diemHP)}">${fmt(s.diemHP)}</span>` : `<span class="score-dash">—</span>`}</td>
      <td class="center">${s.diemChu ? `<span class="letter-badge" style="color:${lColor(s.diemChu)};background:${lBg(s.diemChu)}">${s.diemChu}</span>` : `<span class="score-dash">—</span>`}</td>
      <td class="center">
        <div class="row-actions">
          <button class="icon-btn edit" onclick="openAddModal(${s.id})" title="Chỉnh sửa" aria-label="Chỉnh sửa">✏️</button>
          <button class="icon-btn del" onclick="deleteSubject(${s.id})" title="Xóa" aria-label="Xóa">🗑️</button>
        </div>
      </td>
    </tr>`;
}

function tableHtml(rowsHtml) {
  return `<table class="tbl">
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
        <tbody>${rowsHtml}</tbody>
      </table>`;
}

function deltaBadge(cur, prev) {
  if (cur === null || prev === null || prev === undefined) return "";
  const d = cur - prev;
  if (Math.abs(d) < 0.005) return `<span class="delta delta-flat">＝</span>`;
  return d > 0
    ? `<span class="delta delta-up">▲ ${d.toFixed(2)}</span>`
    : `<span class="delta delta-down">▼ ${Math.abs(d).toFixed(2)}</span>`;
}

function renderGroupedTables(list, superseded) {
  const order = new Map(list.map((s, idx) => [s, idx]));
  const groups = getSemesterGroups(subjects);
  let prevCum = null;
  const html = groups
    .map((g) => {
      const items = g.items
        .filter((s) => order.has(s))
        .sort((a, b) => order.get(a) - order.get(b));
      const delta = deltaBadge(g.cumulative.gpaNum, prevCum);
      if (!g.unassigned) prevCum = g.cumulative.gpaNum;
      if (!items.length) return "";
      const rows = items
        .map((s, i) => subjectRowHtml(s, i, superseded, false))
        .join("");
      return `
    <div class="semester-card">
      <div class="semester-hd">
        <div class="semester-title">📅 ${esc(g.label)}</div>
        <div class="semester-meta">
          <span>GPA kỳ: <strong style="color:${g.stats.gpaNum !== null ? sColor(g.stats.gpaNum * 2.5) : "inherit"}">${g.stats.gpa}</strong></span>
          <span>TC đạt: <strong>${g.stats.passTc}</strong>/${g.stats.totalTc}</span>
          ${g.unassigned ? "" : `<span>Tích lũy: <strong>${g.cumulative.gpa}</strong> ${delta}</span>`}
        </div>
      </div>
      ${tableHtml(rows)}
    </div>`;
    })
    .join("");
  document.getElementById("mainContent").innerHTML = html || emptyStateHtml();
}

function renderTable(list) {
  if (!list.length) {
    document.getElementById("mainContent").innerHTML = emptyStateHtml();
    return;
  }

  const superseded = getSupersededSet(subjects);

  if (getPrefs().groupBySemester) {
    renderGroupedTables(list, superseded);
    return;
  }

  const rows = list
    .map((s, i) => subjectRowHtml(s, i, superseded, true))
    .join("");

  document.getElementById("mainContent").innerHTML = `
    <div class="semester-card">
      ${tableHtml(rows)}
    </div>`;
}
