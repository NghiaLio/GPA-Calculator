// =================== CÔNG CỤ: MỤC TIÊU GPA / MÔ PHỎNG / TIẾN ĐỘ / LỊCH SỬ ===================
let activeToolsTab = "target";
const $id = (id) => document.getElementById(id);

function openToolsModal(tab) {
  switchToolsTab(tab || activeToolsTab);
  $id("toolsModal").classList.remove("hidden");
}

function switchToolsTab(name) {
  activeToolsTab = name;
  document.querySelectorAll("#toolsModal .tab").forEach((b) => {
    const on = b.dataset.tab === name;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-selected", on ? "true" : "false");
  });
  document.querySelectorAll("#toolsModal .tab-panel").forEach((p) => {
    p.classList.toggle("hidden", p.id !== `tab-${name}`);
  });
  if (name === "target") initTarget();
  else if (name === "whatif") initWhatIf();
  else if (name === "grad") initGraduation();
  else if (name === "history") refreshHistoryTab();
}

// Dùng cho các khối kết quả
function resultMsg(level, html) {
  return `<div class="result-msg result-${level}">${html}</div>`;
}

// ---------------------------------------------------------------- Mục tiêu GPA
function initTarget() {
  const prefs = getPrefs();
  if (!$id("t_target").value) $id("t_target").value = prefs.targetGpa;
  if (!$id("t_remain").value) {
    const left = (Number(prefs.totalCredits) || 0) - calcGPA(subjects).passTc;
    $id("t_remain").value = left > 0 ? left : 30;
  }
  calcTarget();
}

function setTargetGpa(v) {
  $id("t_target").value = v;
  calcTarget();
}

function calcTarget() {
  const out = $id("targetResult");
  const target = parseFloat($id("t_target").value);
  const R = parseFloat($id("t_remain").value);

  if (!(target >= 0 && target <= 4)) {
    out.innerHTML = resultMsg("warning", "Nhập GPA mục tiêu trong khoảng 0 – 4.");
    return;
  }
  if (!(R > 0)) {
    out.innerHTML = resultMsg("warning", "Nhập số tín chỉ còn lại lớn hơn 0.");
    return;
  }
  setPref("targetGpa", target);

  const st = calcGPA(subjects);
  const T = st.passTc;
  const P = st.points;
  const passing = currentGrades.filter((g) => g.s4 > 0);
  const maxS4 = Math.max(...currentGrades.map((g) => g.s4));
  const minPass = passing.length ? Math.min(...passing.map((g) => g.s4)) : 0;
  const need = (target * (T + R) - P) / R; // điểm TB thang 4 cần đạt ở R tín chỉ còn lại
  const maxGpa = (P + maxS4 * R) / (T + R);

  let verdict;
  if (need <= minPass) {
    verdict = resultMsg(
      "success",
      `✅ <strong>Gần như chắc chắn đạt.</strong> Chỉ cần qua hết ${R} tín chỉ còn lại là GPA ≥ ${target.toFixed(2)}.`,
    );
  } else if (need > maxS4 + 1e-9) {
    let extra = "";
    if (maxS4 > target) {
      const more = Math.ceil((target * T - P) / (maxS4 - target) - R);
      if (more > 0) extra = ` Bạn cần học thêm khoảng <strong>${more}</strong> tín chỉ nữa (đều đạt điểm cao nhất) mới có thể chạm mục tiêu.`;
    }
    verdict = resultMsg(
      "danger",
      `⛔ <strong>Chưa thể đạt trong ${R} tín chỉ tới.</strong> Dù đạt điểm cao nhất mọi môn, GPA tối đa là <strong>${maxGpa.toFixed(2)}</strong>.${extra}`,
    );
  } else {
    // Mức điểm chữ thấp nhất mà vẫn đủ điểm thang 4 cần thiết
    const g = [...currentGrades].reverse().find((x) => x.s4 >= need - 1e-9);
    const level = need >= maxS4 - 0.2 ? "warning" : "info";
    verdict = resultMsg(
      level,
      `🎯 Cần đạt điểm trung bình <strong>≥ ${need.toFixed(2)}</strong> (thang 4) ở ${R} tín chỉ còn lại` +
        (g
          ? `, tương đương khoảng <strong>${esc(g.letter)}</strong> (điểm học phần ≥ ${g.min.toFixed(1)}).`
          : "."),
    );
  }

  const rows = currentGrades
    .filter((g) => g.s4 > 0)
    .map((g) => {
      const final = (P + g.s4 * R) / (T + R);
      const ok = final + 1e-9 >= target;
      return `<tr class="${ok ? "row-ok" : ""}">
        <td><span class="letter-badge" style="color:${lColor(g.letter)};background:${lBg(g.letter)}">${esc(g.letter)}</span></td>
        <td class="center">≥ ${g.min.toFixed(1)}</td>
        <td class="center"><strong>${final.toFixed(2)}</strong></td>
        <td class="center">${ok ? "✅" : "—"}</td>
      </tr>`;
    })
    .join("");

  out.innerHTML = `
    <div class="kpi-row">
      <div class="kpi"><span>GPA hiện tại</span><strong>${st.gpa}</strong></div>
      <div class="kpi"><span>Tín chỉ đã tích lũy</span><strong>${T}</strong></div>
      <div class="kpi"><span>GPA tối đa có thể</span><strong>${maxGpa.toFixed(2)}</strong></div>
    </div>
    ${verdict}
    <h3 class="tool-subtitle">Nếu mọi môn còn lại đều đạt…</h3>
    <div class="table-scroll">
      <table class="scale-tbl scenario-tbl">
        <thead><tr><th>Điểm chữ</th><th class="center">Điểm HP</th><th class="center">GPA dự kiến</th><th class="center">Đạt mục tiêu</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ---------------------------------------------------------------- Mô phỏng
function initWhatIf() {
  const sel = $id("w_subject");
  const prev = sel.value;
  const opt = (s) =>
    `<option value="${s.id}">${esc(s.tenMon)} — ${s.diemChu ? esc(s.diemChu) : "chưa thi"}</option>`;
  const pending = subjects.filter((s) => s.diemThi === null || s.diemThi === undefined);
  const done = subjects.filter((s) => s.diemThi !== null && s.diemThi !== undefined);

  if (!subjects.length) {
    sel.innerHTML = `<option value="">Chưa có môn học nào</option>`;
  } else {
    sel.innerHTML =
      (pending.length
        ? `<optgroup label="Chưa có điểm thi">${pending.map(opt).join("")}</optgroup>`
        : "") +
      (done.length
        ? `<optgroup label="Đã có điểm (thử cải thiện)">${done.map(opt).join("")}</optgroup>`
        : "");
    if (prev && subjects.some((s) => String(s.id) === prev)) sel.value = prev;
  }
  onWhatIfSubjectChange();
}

function whatIfSubject() {
  const id = $id("w_subject").value;
  return subjects.find((s) => String(s.id) === id) || null;
}

function onWhatIfSubjectChange() {
  const s = whatIfSubject();
  const cur = $id("w_current");
  const score = $id("w_score");
  if (!s) {
    cur.textContent = "—";
    score.value = "";
    calcWhatIf();
    return;
  }
  const hasThi = s.diemThi !== null && s.diemThi !== undefined;
  cur.textContent = hasThi
    ? `Thi ${fmt(s.diemThi)} → HP ${fmt(s.diemHP)} (${s.diemChu || "—"})`
    : "Chưa có điểm thi";
  score.value = hasThi ? Math.min(10, +(s.diemThi + 1).toFixed(1)) : 8;
  calcWhatIf();
}

function calcWhatIf() {
  const out = $id("whatIfResult");
  const s = whatIfSubject();
  if (!s) {
    out.innerHTML = resultMsg("info", "Hãy thêm môn học trước để chạy mô phỏng.");
    return;
  }
  const raw = $id("w_score").value;
  const x = parseFloat(raw);
  if (raw === "" || isNaN(x) || x < 0 || x > 10) {
    out.innerHTML = resultMsg("warning", "Nhập điểm thi giả định từ 0 đến 10.");
    return;
  }

  const hypo = compute({ ...s, diemThi: x });
  const modified = subjects.map((v) => (v.id === s.id ? hypo : v));
  const before = calcGPA(subjects);
  const after = calcGPA(modified);
  const delta =
    before.gpaNum !== null && after.gpaNum !== null ? after.gpaNum - before.gpaNum : null;
  const deltaHtml =
    delta === null
      ? ""
      : Math.abs(delta) < 0.005
        ? `<span class="delta delta-flat">＝ không đổi</span>`
        : delta > 0
          ? `<span class="delta delta-up">▲ +${delta.toFixed(2)}</span>`
          : `<span class="delta delta-down">▼ ${delta.toFixed(2)}</span>`;

  const note =
    hypo.diemChu === "F"
      ? resultMsg("warning", "Với mức điểm này môn sẽ bị <strong>F</strong> nên không được tính vào GPA và bạn sẽ nợ tín chỉ.")
      : "";

  out.innerHTML = `
    <div class="kpi-row">
      <div class="kpi"><span>GPA hiện tại</span><strong>${before.gpa}</strong></div>
      <div class="kpi kpi-arrow">→</div>
      <div class="kpi kpi-accent"><span>GPA sau khi thay đổi</span><strong>${after.gpa}</strong> ${deltaHtml}</div>
    </div>
    <div class="kpi-row">
      <div class="kpi"><span>Điểm học phần mới</span><strong style="color:${sColor(hypo.diemHP)}">${fmt(hypo.diemHP)}</strong></div>
      <div class="kpi"><span>Điểm chữ</span><strong style="color:${lColor(hypo.diemChu)}">${esc(hypo.diemChu || "—")}</strong></div>
      <div class="kpi"><span>Xếp loại GPA</span><strong style="font-size:15px;color:${rankColor(after.rank)}">${after.rank}</strong></div>
    </div>
    ${note}`;
}

// ---------------------------------------------------------------- Tiến độ tốt nghiệp
function initGraduation() {
  if (!$id("g_total").value) $id("g_total").value = getPrefs().totalCredits;
  calcGraduation();
}

function calcGraduation() {
  const total = parseFloat($id("g_total").value) || 0;
  if (total > 0) setPref("totalCredits", total);

  const st = calcGPA(subjects);
  const remain = Math.max(0, total - st.passTc);
  const pct = total > 0 ? Math.min(100, (st.passTc / total) * 100) : 0;
  const semesters = getSemesterGroups(subjects).filter((g) => !g.unassigned && g.stats.passTc > 0);
  const avgPerSem = semesters.length ? st.passTc / semesters.length : 0;
  const semLeft = avgPerSem > 0 && remain > 0 ? Math.ceil(remain / avgPerSem) : 0;

  $id("gradResult").innerHTML = `
    <div class="progress" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-fill" style="width:${pct}%"></div>
      <span class="progress-label">${pct.toFixed(0)}%</span>
    </div>
    <div class="kpi-row kpi-wrap">
      <div class="kpi"><span>Đã tích lũy</span><strong>${st.passTc}</strong></div>
      <div class="kpi"><span>Còn lại</span><strong>${total > 0 ? remain : "—"}</strong></div>
      <div class="kpi"><span>Đang nợ (F)</span><strong style="color:${st.failTc ? "var(--red)" : "inherit"}">${st.failTc}</strong></div>
      <div class="kpi"><span>Dự kiến còn</span><strong>${semLeft ? semLeft + " kỳ" : "—"}</strong></div>
    </div>
    ${
      semLeft
        ? `<p class="tool-note">Ước tính dựa trên trung bình ${avgPerSem.toFixed(1)} tín chỉ đạt mỗi học kỳ (${semesters.length} kỳ đã nhập).</p>`
        : ""
    }`;

  const alerts = computeAlerts();
  $id("gradAlerts").innerHTML = alerts.length
    ? alerts
        .map(
          (a) => `<div class="alert alert-${a.level}">
            <span class="alert-icon">${a.icon}</span>
            <div><strong>${a.title}</strong><div>${a.text}</div></div>
          </div>`,
        )
        .join("")
    : resultMsg("success", "✅ Chưa có cảnh báo nào. Hãy tiếp tục phát huy!");

  if (typeof renderAlerts === "function") renderAlerts();
}

// ---------------------------------------------------------------- Lịch sử
function refreshHistoryTab() {
  const list = $id("historyList");
  if (!list) return;
  const count = $id("historyCount");
  if (count) count.textContent = `${undoStack.length} bước có thể hoàn tác · ${redoStack.length} bước có thể làm lại`;

  if (!undoStack.length) {
    list.innerHTML = `<li class="history-empty">Chưa có thay đổi nào trong phiên này.</li>`;
    return;
  }
  list.innerHTML = undoStack
    .map((e, i) => ({ e, i }))
    .reverse()
    .map(({ e, i }) => {
      const t = new Date(e.time).toLocaleTimeString("vi-VN", { hour12: false });
      return `<li class="history-item">
        <div class="history-main">
          <span class="history-label">${esc(e.label)}</span>
          <span class="history-time">${t}</span>
        </div>
        <button class="btn btn-outline btn-sm" onclick="undoTo(${i})" title="Quay về trạng thái ngay trước thao tác này">⏪ Khôi phục</button>
      </li>`;
    })
    .join("");
}
