// =================== INSIGHTS: CẢNH BÁO & BIỂU ĐỒ ===================

// ---------- Cảnh báo học vụ / tiến độ ----------
// Các ngưỡng mang tính tham khảo theo quy chế phổ biến; mỗi trường có thể khác.
function computeAlerts() {
  const alerts = [];
  if (!subjects.length) return alerts;

  const st = calcGPA(subjects);
  const prefs = getPrefs();
  const groups = getSemesterGroups(subjects).filter(
    (g) => !g.unassigned && g.stats.gpaNum !== null,
  );
  const last = groups[groups.length - 1];

  if (st.gpaNum !== null && st.gpaNum < 2.0) {
    alerts.push({
      level: "danger",
      icon: "🚨",
      title: `GPA tích lũy ${st.gpa} đang dưới 2.0`,
      text: "Nhiều trường xét cảnh báo học vụ và chưa đủ điều kiện tốt nghiệp khi GPA tích lũy dưới 2.0. Dùng 🧮 Công cụ › Mục tiêu GPA để lên kế hoạch cải thiện.",
    });
  }

  if (last && last.stats.gpaNum < 1.0) {
    alerts.push({
      level: "danger",
      icon: "🚨",
      title: `GPA ${last.label} chỉ ${last.stats.gpa}`,
      text: "GPA học kỳ dưới 1.0 thường là mốc bị cảnh báo học vụ. Hãy liên hệ cố vấn học tập sớm.",
    });
  }

  if (st.failTc > 0) {
    alerts.push({
      level: "warning",
      icon: "⚠️",
      title: `Đang nợ ${st.failTc} tín chỉ (điểm F)`,
      text: "Đánh dấu môn là “học lại” để chỉ tính lần điểm cao nhất, hoặc thử 🧪 Mô phỏng để xem cải thiện bao nhiêu GPA.",
    });
  }

  const effective = getEffectiveSubjects(subjects);
  const pending = effective.filter(
    (s) => s.diemThi === null || s.diemThi === undefined,
  ).length;
  if (pending > 0) {
    alerts.push({
      level: "info",
      icon: "📝",
      title: `Còn ${pending} môn chưa có điểm thi`,
      text: "Các môn này chưa được tính vào GPA. Dùng 🧪 Mô phỏng để thử các mức điểm thi.",
    });
  }

  // Còn thiếu bao nhiêu để lên loại tiếp theo
  const thresholds = [
    [2.0, "Trung bình"],
    [2.5, "Khá"],
    [3.2, "Giỏi"],
    [3.6, "Xuất sắc"],
  ];
  if (st.gpaNum !== null) {
    const next = thresholds.find(([t]) => st.gpaNum < t);
    if (next && next[0] - st.gpaNum <= 0.15 && st.gpaNum >= 2.0) {
      alerts.push({
        level: "info",
        icon: "🎯",
        title: `Chỉ cần thêm ${(next[0] - st.gpaNum).toFixed(2)} GPA để đạt loại ${next[1]}`,
        text: "Mở 🧮 Công cụ › Mục tiêu GPA để xem cần đạt bao nhiêu điểm ở các môn còn lại.",
      });
    }
  }

  const total = Number(prefs.totalCredits) || 0;
  if (total > 0 && st.passTc >= total && st.gpaNum !== null && st.gpaNum >= 2.0) {
    alerts.push({
      level: "success",
      icon: "🎓",
      title: `Đã tích lũy đủ ${total} tín chỉ`,
      text: `GPA ${st.gpa} (${st.rank}). Bạn đã đạt điều kiện về tín chỉ và điểm trung bình để xét tốt nghiệp.`,
    });
  }

  return alerts;
}

// ---------- Biểu đồ ----------
function gpaChartSvg(groups) {
  const W = 560;
  const H = 250;
  const m = { l: 34, r: 14, t: 18, b: groups.length > 5 ? 58 : 44 };
  const pw = W - m.l - m.r;
  const ph = H - m.t - m.b;
  const slot = pw / groups.length;
  const barW = Math.min(46, slot * 0.55);
  const y = (v) => m.t + ph * (1 - v / 4);
  const x = (i) => m.l + slot * i + slot / 2;

  let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Biểu đồ GPA theo học kỳ">`;

  for (let v = 0; v <= 4; v++) {
    svg += `<line class="ch-grid" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/>`;
    svg += `<text class="ch-txt" x="${m.l - 8}" y="${y(v) + 3}" text-anchor="end">${v}</text>`;
  }

  groups.forEach((g, i) => {
    const v = g.stats.gpaNum;
    const bx = x(i) - barW / 2;
    const by = y(v);
    svg += `<rect class="ch-bar" x="${bx}" y="${by}" width="${barW}" height="${y(0) - by}" rx="5"><title>${esc(g.label)}: GPA kỳ ${g.stats.gpa}</title></rect>`;
    svg += `<text class="ch-val" x="${x(i)}" y="${by - 6}" text-anchor="middle">${Number(v).toFixed(2)}</text>`;
    const lx = x(i);
    const ly = H - m.b + 16;
    if (groups.length > 5) {
      svg += `<text class="ch-txt" transform="rotate(-35 ${lx} ${ly})" x="${lx}" y="${ly}" text-anchor="end">${esc(g.shortLabel)}</text>`;
    } else {
      svg += `<text class="ch-txt" x="${lx}" y="${ly}" text-anchor="middle">${esc(g.shortLabel)}</text>`;
    }
  });

  const pts = groups
    .map((g, i) => (g.cumulative.gpaNum === null ? null : [x(i), y(g.cumulative.gpaNum), g]))
    .filter(Boolean);
  if (pts.length > 1) {
    svg += `<polyline class="ch-line" points="${pts.map((p) => `${p[0]},${p[1]}`).join(" ")}"/>`;
  }
  pts.forEach(([px, py, g]) => {
    svg += `<circle class="ch-dot" cx="${px}" cy="${py}" r="4.5"><title>${esc(g.label)}: tích lũy ${g.cumulative.gpa}</title></circle>`;
  });

  return svg + "</svg>";
}

function letterDistributionHtml() {
  const graded = getEffectiveSubjects(subjects).filter((s) => s.diemChu);
  if (!graded.length) return `<p class="insight-empty">Chưa có môn nào có điểm.</p>`;

  const counts = new Map();
  graded.forEach((s) => counts.set(s.diemChu, (counts.get(s.diemChu) || 0) + 1));
  // Theo thứ tự thang điểm hiện tại, sau đó là các điểm chữ còn lại (nếu thang điểm đã đổi)
  const order = currentGrades.map((g) => g.letter);
  counts.forEach((_, l) => {
    if (!order.includes(l)) order.push(l);
  });
  const max = Math.max(...counts.values());

  return order
    .filter((l) => counts.has(l))
    .map((l) => {
      const c = counts.get(l);
      return `<div class="dist-row">
        <span class="letter-badge dist-letter" style="color:${lColor(l)};background:${lBg(l)}">${esc(l)}</span>
        <div class="dist-track"><div class="dist-fill" style="width:${(c / max) * 100}%;background:${lColor(l)}"></div></div>
        <span class="dist-count">${c}</span>
      </div>`;
    })
    .join("");
}

function topBottomHtml() {
  const graded = getEffectiveSubjects(subjects)
    .filter((s) => s.diemHP !== null && s.diemHP !== undefined)
    .sort((a, b) => b.diemHP - a.diemHP);
  if (graded.length < 2) return `<p class="insight-empty">Cần ít nhất 2 môn có điểm để so sánh.</p>`;

  const item = (s) => `<li>
      <span class="tb-name" title="${esc(s.tenMon)}">${esc(s.tenMon)}</span>
      <span class="tb-score" style="color:${sColor(s.diemHP)}">${fmt(s.diemHP)}</span>
      <span class="letter-badge" style="color:${lColor(s.diemChu)};background:${lBg(s.diemChu)}">${esc(s.diemChu)}</span>
    </li>`;

  const n = Math.min(3, Math.floor(graded.length / 2));
  const best = graded.slice(0, n);
  const worst = graded.slice(-n).reverse();
  return `
    <div class="tb-title">🏆 Điểm cao nhất</div>
    <ul class="tb-list">${best.map(item).join("")}</ul>
    <div class="tb-title">📉 Cần cố gắng thêm</div>
    <ul class="tb-list">${worst.map(item).join("")}</ul>`;
}

function toggleInsights() {
  setPref("showInsights", !getPrefs().showInsights);
  renderInsights();
  syncToolbarState();
}

function renderInsights() {
  const panel = document.getElementById("insightsPanel");
  if (!panel) return;
  const show = getPrefs().showInsights;
  panel.classList.toggle("hidden", !show);
  if (!show) return;

  if (!subjects.length) {
    panel.innerHTML = `<div class="insight-card"><p class="insight-empty">Thêm môn học để xem biểu đồ phân tích.</p></div>`;
    return;
  }

  const groups = getSemesterGroups(subjects).filter(
    (g) => !g.unassigned && g.stats.gpaNum !== null,
  );

  const gpaCard = groups.length
    ? `${gpaChartSvg(groups)}
       <div class="chart-legend">
         <span><i class="lg-bar"></i> GPA từng kỳ</span>
         <span><i class="lg-line"></i> GPA tích lũy</span>
       </div>`
    : `<p class="insight-empty">Chọn <strong>Năm học</strong> và <strong>Học kỳ</strong> cho các môn đã có điểm để xem xu hướng GPA theo kỳ.</p>`;

  panel.innerHTML = `
    <div class="insight-grid">
      <section class="insight-card insight-wide">
        <h2 class="insight-title">📈 GPA theo học kỳ</h2>
        ${gpaCard}
      </section>
      <section class="insight-card">
        <h2 class="insight-title">🔤 Phân bố điểm chữ</h2>
        ${letterDistributionHtml()}
      </section>
      <section class="insight-card">
        <h2 class="insight-title">⭐ Nổi bật</h2>
        ${topBottomHtml()}
      </section>
    </div>`;
}
