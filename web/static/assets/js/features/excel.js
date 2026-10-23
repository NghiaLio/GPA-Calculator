// =================== EXCEL IMPORT ===================
function handleExcel(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      if (rows.length < 2) {
        showToast("File không có dữ liệu!", "warning");
        return;
      }

      const hdr = rows[0].map((h) =>
        String(h).toLowerCase().replace(/\s+/g, " ").trim(),
      );
      const find = (kws) => {
        for (const kw of kws) {
          const i = hdr.findIndex((h) => h.includes(kw));
          if (i >= 0) return i;
        }
        return -1;
      };
      const ci = {
        name: find(["tên môn", "ten mon", "môn", "subject", "name"]),
        sem: find(["kỳ", "ky", "học kỳ", "hk", "semester"]),
        tc: find(["tín", "tin", "tín chỉ", "tc", "credit"]),
        tp1: find(["tp1", "gk", "giữa kỳ", "giua ky", "midterm"]),
        tp2: find(["tp2", "cc", "chuyên cần", "chuyen can"]),
        thi: find(["điểm thi", "diem thi", "thi", "final", "ck"]),
        year: find(["năm học", "nam hoc", "year"]),
      };

      if (ci.name < 0) {
        showToast(
          "Không tìm thấy cột tên môn học!\nHãy đảm bảo file có cột: Tên môn, Kỳ, Tín, TP1, TP2, Thi",
          "error"
        );
        return;
      }

      const imported = [];
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r[ci.name]) continue;
        imported.push(
          compute({
            id: uid(),
            namHoc: ci.year >= 0 ? String(r[ci.year] || "") : "",
            hocKy: ci.sem >= 0 ? String(r[ci.sem] || "1") : "1",
            tenMon: String(r[ci.name]),
            tinChi: ci.tc >= 0 ? parseFloat(r[ci.tc]) || 3 : 3,
            tp1: ci.tp1 >= 0 ? (parseScore(r[ci.tp1]) ?? 0) : 0,
            tp2: ci.tp2 >= 0 ? (parseScore(r[ci.tp2]) ?? 0) : 0,
            diemThi: ci.thi >= 0 ? parseScore(r[ci.thi]) : null,
          }),
        );
      }

      if (!imported.length) {
        showToast("Không tìm thấy dữ liệu hợp lệ!", "warning");
        return;
      }

      const msg = `Tìm thấy ${imported.length} môn học trong file "${file.name}".\n\nNhấn OK để thêm vào danh sách hiện tại.\nNhấn Cancel để thay thế toàn bộ.`;
      const confirmed = await showConfirm(msg);
      if (confirmed) subjects = [...subjects, ...imported];
      else subjects = imported;
      input.value = "";
      saveState();
      renderAll();
      showToast(`✅ Đã nhập thành công ${imported.length} môn học!`, "success");
    } catch (err) {
      console.error(err);
      showToast("Lỗi đọc file: " + err.message, "error");
    }
  };
  reader.readAsArrayBuffer(file);
}

// =================== EXPORT EXCEL ===================
function exportToExcel() {
  if (!subjects.length) {
    showToast("Chưa có dữ liệu để xuất!", "warning");
    return;
  }
  const data = [
    [
      "Năm học",
      "Học kỳ",
      "Môn học",
      "Tín chỉ",
      "TP1",
      "TP2",
      "ĐQT",
      "Điểm thi",
      "Điểm HP",
      "Điểm chữ",
      "Thang 4",
      "Xếp loại",
    ],
  ];
  for (const s of subjects) {
    data.push([
      s.namHoc,
      s.hocKy,
      s.tenMon,
      s.tinChi,
      s.tp1,
      s.tp2,
      s.dqt,
      s.diemThi ?? "",
      s.diemHP ?? "",
      s.diemChu ?? "",
      s.s4 ?? "",
      s.rank ?? "",
    ]);
  }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [10, 10, 30, 8, 8, 8, 8, 10, 10, 10, 8, 16].map((w) => ({
    wch: w,
  }));
  XLSX.utils.book_append_sheet(wb, ws, "Bảng điểm");

  // Summary sheet
  const gpa = calcGPA(subjects);
  const sum = [
    ["GPA tích lũy (thang 4)", gpa.gpa],
    ["Xếp loại", gpa.rank],
    ["Tổng tín chỉ đã học", gpa.totalTc],
    ["Tín chỉ qua môn (tính GPA)", gpa.passTc],
    ["Tín chỉ không đạt (F)", gpa.failTc],
    ["Tổng số môn", gpa.n],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(sum);
  ws2["!cols"] = [{ wch: 28 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Tổng hợp GPA");

  XLSX.writeFile(
    wb,
    "bang_diem_" + new Date().toISOString().slice(0, 10) + ".xlsx",
  );
}
