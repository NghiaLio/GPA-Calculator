// =================== XUẤT BÁO CÁO: PDF & ẢNH ===================
function reportDateStr() {
  return new Date().toISOString().slice(0, 10);
}

function reportRowHtml(s, i, superseded) {
  const out = superseded.has(s);
  const hp = s.diemHP !== null && s.diemHP !== undefined;
  return `<tr class="${out ? "rp-muted" : ""}">
    <td class="c">${i + 1}</td>
    <td>${esc(s.tenMon)}${s.hocLai ? ' <em class="rp-tag">học lại</em>' : ""}${out ? ' <em class="rp-tag rp-tag-gray">không tính GPA</em>' : ""}</td>
    <td class="c">${s.tinChi}</td>
    <td class="c">${fmt(s.dqt)}</td>
    <td class="c">${s.diemThi !== null && s.diemThi !== undefined ? fmt(s.diemThi) : "—"}</td>
    <td class="c"><strong>${hp ? fmt(s.diemHP) : "—"}</strong></td>
    <td class="c">${s.diemChu ? `<span class="rp-letter" style="color:${lColor(s.diemChu)};background:${lBg(s.diemChu)}">${esc(s.diemChu)}</span>` : "—"}</td>
    <td class="c">${s.s4 !== null && s.s4 !== undefined ? Number(s.s4).toFixed(1) : "—"}</td>
  </tr>`;
}

function buildReportHtml() {
  const st = calcGPA(subjects);
  const superseded = getSupersededSet(subjects);
  const groups = getSemesterGroups(subjects);
  const onlyUnassigned = groups.length === 1 && groups[0].unassigned;
  const who =
    typeof currentUser !== "undefined" && currentUser
      ? currentUser.displayName || currentUser.email
      : "";
  const date = new Date().toLocaleDateString("vi-VN");

  const sections = groups
    .map((g) => {
      const meta = g.unassigned
        ? `GPA: ${g.stats.gpa}`
        : `GPA kỳ: ${g.stats.gpa} · Tích lũy: ${g.cumulative.gpa}`;
      const title = onlyUnassigned ? "Danh sách môn học" : g.label;
      return `<section class="rp-sem">
        <h2><span>${esc(title)}</span><small>${meta} · ${g.stats.passTc}/${g.stats.totalTc} TC đạt</small></h2>
        <table>
          <thead><tr><th class="c">#</th><th>Môn học</th><th class="c">TC</th><th class="c">ĐQT</th><th class="c">Thi</th><th class="c">Điểm HP</th><th class="c">Chữ</th><th class="c">Thang 4</th></tr></thead>
          <tbody>${g.items.map((s, i) => reportRowHtml(s, i, superseded)).join("")}</tbody>
        </table>
      </section>`;
    })
    .join("");

  return `<div class="rp">
    <header class="rp-head">
      <div>
        <h1>📊 Bảng điểm học tập</h1>
        <p>${who ? esc(who) + " · " : ""}Ngày xuất ${date}</p>
      </div>
      <div class="rp-gpa">
        <span>GPA tích lũy (thang 4)</span>
        <strong>${st.gpa}</strong>
        <em style="color:${st.rank !== "—" ? rankColor(st.rank) : "#6b7280"}">${st.rank}</em>
      </div>
    </header>
    <div class="rp-stats">
      <div><span>Tổng tín chỉ</span><strong>${st.totalTc}</strong></div>
      <div><span>Tín chỉ đạt</span><strong>${st.passTc}</strong></div>
      <div><span>Tín chỉ nợ</span><strong>${st.failTc}</strong></div>
      <div><span>Số môn</span><strong>${getEffectiveSubjects(subjects).length}</strong></div>
    </div>
    ${sections}
    <footer class="rp-foot">
      ĐQT = TP1×${currentWeights.tp1} + TP2×${currentWeights.tp2} · Điểm HP = ĐQT×${currentWeights.dqt} + Thi×${currentWeights.thi} · GPA = Σ(điểm thang 4 × tín chỉ) / Σ tín chỉ (không tính môn F).
    </footer>
  </div>`;
}

function ensureReportHost() {
  let host = document.getElementById("printReport");
  if (!host) {
    host = document.createElement("div");
    host.id = "printReport";
    document.body.appendChild(host);
  }
  return host;
}

// In / Lưu thành PDF thông qua hộp thoại in của trình duyệt
function exportPdf() {
  if (!subjects.length) {
    showToast("Chưa có dữ liệu để xuất!", "warning");
    return;
  }
  const host = ensureReportHost();
  host.innerHTML = buildReportHtml();
  document.body.classList.add("printing-report");

  const done = () => {
    document.body.classList.remove("printing-report");
    host.innerHTML = "";
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  showToast("Trong hộp thoại in, chọn “Lưu dưới dạng PDF”", "info", { duration: 4000 });
  setTimeout(() => window.print(), 300);
}

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded) resolve();
      else existing.addEventListener("load", resolve);
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.dataset.src = src;
    s.onload = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = () => reject(new Error("Không tải được thư viện: " + src));
    document.head.appendChild(s);
  });
}

// Xuất báo cáo thành ảnh PNG để chia sẻ
async function exportImage() {
  if (!subjects.length) {
    showToast("Chưa có dữ liệu để xuất!", "warning");
    return;
  }
  showToast("Đang tạo ảnh…", "info", { duration: 2000 });
  const stage = document.createElement("div");
  stage.className = "rp-stage";
  stage.innerHTML = buildReportHtml();
  document.body.appendChild(stage);
  try {
    await loadScriptOnce(
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
    );
    const canvas = await window.html2canvas(stage.firstElementChild, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = `bang_diem_${reportDateStr()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("Đã lưu ảnh bảng điểm", "success");
  } catch (err) {
    console.error(err);
    showToast("Không tạo được ảnh. Kiểm tra kết nối mạng và thử lại.", "error");
  } finally {
    stage.remove();
  }
}

// ---------- Menu "Xuất" ở header ----------
function toggleExportMenu(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById("exportMenu");
  if (!menu) return;
  const open = menu.classList.toggle("hidden") === false;
  const btn = document.getElementById("btnExport");
  if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
}

function closeExportMenu() {
  const menu = document.getElementById("exportMenu");
  if (menu) menu.classList.add("hidden");
  const btn = document.getElementById("btnExport");
  if (btn) btn.setAttribute("aria-expanded", "false");
}

document.addEventListener("click", (e) => {
  if (!e.target.closest || !e.target.closest(".dropdown")) closeExportMenu();
});
