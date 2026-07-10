// =================== COLORS ===================
function sColor(v) {
  const n = parseFloat(v);
  if (isNaN(n)) return "#9ca3af";
  if (n >= 8.5) return "#16a34a";
  if (n >= 7.0) return "#2563eb";
  if (n >= 5.5) return "#d97706";
  return "#dc2626";
}
function lColor(l) {
  if (!l) return "#9ca3af";
  if (["A+", "A"].includes(l)) return "#16a34a";
  if (["B+", "B"].includes(l)) return "#2563eb";
  if (["C+", "C"].includes(l)) return "#d97706";
  if (["D+", "D"].includes(l)) return "#ea580c";
  return "#dc2626";
}
function lBg(l) {
  if (!l) return "#f3f4f6";
  if (["A+", "A"].includes(l)) return "#dcfce7";
  if (["B+", "B"].includes(l)) return "#dbeafe";
  if (["C+", "C"].includes(l)) return "#fef3c7";
  if (["D+", "D"].includes(l)) return "#ffedd5";
  return "#fee2e2";
}
function rankColor(r) {
  if (r === "Xuất sắc") return "#16a34a";
  if (r === "Giỏi") return "#2563eb";
  if (r === "Khá") return "#d97706";
  if (r === "Trung bình") return "#ea580c";
  return "#dc2626";
}

function fmtRounded(v, d = 1) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  const fixed = n.toFixed(Math.max(d + 4, 10));
  const [intPart, fracPart = ""] = fixed.split(".");
  if (d <= 0) return String(Math.round(Number(fixed)));

  const digits = fracPart
    .padEnd(d + 1, "0")
    .slice(0, d + 1)
    .split("")
    .map(Number);
  let carry = digits[d] >= 5 ? 1 : 0;
  const rounded = digits.slice(0, d);

  for (let i = d - 1; i >= 0 && carry; i--) {
    const next = rounded[i] + carry;
    rounded[i] = next % 10;
    carry = Math.floor(next / 10);
  }

  let integer = intPart;
  if (carry) integer = String(Number(intPart) + 1);
  return `${integer}.${rounded.join("").padEnd(d, "0")}`;
}

function fmt(v, d = 1) {
  return fmtRounded(v, d);
}
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
