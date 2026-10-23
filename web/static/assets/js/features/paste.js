// =================== PASTE MODAL ===================
function openPasteModal() {
  V("pasteInput", "");
  pasteRows = [];
  document.getElementById("pastePreviewWrap").classList.add("hidden");
  document.getElementById("btnConfirmPaste").disabled = true;
  document.getElementById("pasteModal").classList.remove("hidden");
  setTimeout(() => document.getElementById("pasteInput").focus(), 100);
}

function parsePasteInput() {
  const text = document.getElementById("pasteInput").value;
  if (!text.trim()) {
    document.getElementById("pastePreviewWrap").classList.add("hidden");
    document.getElementById("btnConfirmPaste").disabled = true;
    pasteRows = [];
    return;
  }
  pasteRows = parsePasteText(text);
  const hasWarn = pasteRows.some((r) => r._warn);
  document.getElementById("previewCount").textContent = pasteRows.length;
  document.getElementById("warnCredits").classList.toggle("hidden", !hasWarn);

  const tbody = document.getElementById("pastePreviewBody");
  tbody.innerHTML = pasteRows
    .map(
      (s) => `<tr class="${s._warn ? "warn-row" : ""}">
    <td style="text-align:left">${esc(s.tenMon)}</td>
    <td>${s.tinChi}${s._warn ? " ⚠️" : ""}</td>
    <td style="color:${sColor(s.tp1)}">${fmt(s.tp1)}</td>
    <td style="color:${sColor(s.tp2)}">${fmt(s.tp2)}</td>
    <td style="color:${sColor(s.dqt)}">${fmt(s.dqt)}</td>
    <td style="color:${s.diemThi !== null ? sColor(s.diemThi) : "#9ca3af"}">${s.diemThi !== null ? fmt(s.diemThi) : "—"}</td>
    <td style="color:${s.diemHP !== null ? sColor(s.diemHP) : "#9ca3af"}">${s.diemHP !== null ? fmt(s.diemHP) : "—"}</td>
    <td>${s.diemChu ? `<span class="letter-badge" style="color:${lColor(s.diemChu)};background:${lBg(s.diemChu)}">${s.diemChu}</span>` : "—"}</td>
  </tr>`,
    )
    .join("");

  document
    .getElementById("pastePreviewWrap")
    .classList.toggle("hidden", pasteRows.length === 0);
  document.getElementById("btnConfirmPaste").disabled = pasteRows.length === 0;
}

function parsePasteText(text) {
  const lines = text
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^(#|stt|môn học|môn thi|subject)/i.test(l));
  const results = [];
  for (const line of lines) {
    const sep = line.includes("\t") ? "\t" : ",";
    const cols = line.split(sep).map((c) => c.trim());
    if (cols.length < 4) continue;

    let s = null;

    const yearIdx = cols.findIndex((c) => /^\d{4}-\d{4}$/.test(c));
    if (yearIdx >= 0 && cols.length >= yearIdx + 7) {
      const base = yearIdx;
      s = {
        id: uid(),
        namHoc: cols[base],
        hocKy: cols[base + 1],
        tenMon: cols[base + 2],
        tinChi: 3,
        tp1: parseScore(cols[base + 4]),
        tp2: parseScore(cols[base + 5]),
        diemThi: parseScore(cols[base + 7]),
        _warn: true,
      };
    } else if (cols.length >= 6 && !isNaN(parseFloat(cols[2]))) {
      s = {
        id: uid(),
        namHoc: cols[6] || "",
        hocKy: cols[1] || "1",
        tenMon: cols[0],
        tinChi: parseFloat(cols[2]) || 3,
        tp1: parseScore(cols[3]),
        tp2: parseScore(cols[4]),
        diemThi: parseScore(cols[5]),
      };
    }
    if (s) {
      s.tp1 = s.tp1 ?? 0;
      s.tp2 = s.tp2 ?? 0;
      results.push(compute(s));
    }
  }
  return results;
}

function confirmPaste() {
  subjects = [...subjects, ...pasteRows];
  closeModal("pasteModal");
  saveState();
  renderAll();
}
