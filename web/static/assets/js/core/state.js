// =================== STATE ===================
let _id = 1;
const uid = () => _id++;

let subjects = [];
let editingId = null;
let pasteRows = [];

// Trạng thái cho Search & Sort
let searchQuery = "";
let sortMode = "default"; // default, name_asc, name_desc, hp_desc, hp_asc, tc_desc

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (m) => (m === "đ" ? "d" : "d"))
    .toLowerCase()
    .trim();
}

function setFilterSearch(query) {
  searchQuery = (query || "").trim();
}

function setFilterSort(mode) {
  sortMode = mode || "default";
}

function getProcessedSubjects() {
  let list = [...subjects];

  // Lọc theo tìm kiếm
  if (searchQuery !== "") {
    const rawQ = searchQuery.toLowerCase();
    const normQ = normalizeText(searchQuery);
    const qWords = normQ.split(/\s+/).filter(Boolean);

    list = list.filter((s) => {
      const rawName = String(s.tenMon || "").toLowerCase();
      const normName = normalizeText(s.tenMon);

      // 1. Khớp chính xác có dấu (VD: "Toán" khớp "Toán cao cấp")
      if (rawName.includes(rawQ)) return true;

      // 2. Khớp không dấu (VD: "toan" hoặc "Toán" đều khớp "Toán")
      if (normName.includes(normQ)) return true;

      // 3. Khớp theo điểm chữ (VD: tìm môn bị "F", môn đạt "A+")
      if (s.diemChu && String(s.diemChu).toLowerCase() === rawQ) return true;

      // 4. Khớp tất cả các từ trong cụm từ tìm kiếm (không phân biệt thứ tự)
      if (qWords.length > 1 && qWords.every((w) => normName.includes(w))) {
        return true;
      }

      return false;
    });
  }

  // Sắp xếp
  if (sortMode !== "default") {
    list.sort((a, b) => {
      // Hàm tính điểm HP lấy tạm logic từ grade.js
      // dqt = tp1*tp1W + tp2*tp2W
      // hp = dqt*dqtW + thi*thiW
      const getHp = (s) => {
        const tp1 = parseScore(s.tp1) ?? 0;
        const tp2 = parseScore(s.tp2) ?? 0;
        const thi = parseScore(s.diemThi);
        if (thi === null) return -1; // Chưa thi
        const dqt = tp1 * currentWeights.tp1 + tp2 * currentWeights.tp2;
        return dqt * currentWeights.dqt + thi * currentWeights.thi;
      };

      if (sortMode === "name_asc") {
        return normalizeText(a.tenMon).localeCompare(normalizeText(b.tenMon));
      }
      if (sortMode === "name_desc") {
        return normalizeText(b.tenMon).localeCompare(normalizeText(a.tenMon));
      }
      if (sortMode === "tc_desc") {
        return (parseFloat(b.tinChi) || 0) - (parseFloat(a.tinChi) || 0);
      }
      if (sortMode === "hp_desc") {
        return getHp(b) - getHp(a);
      }
      if (sortMode === "hp_asc") {
        return getHp(a) - getHp(b);
      }
      return 0;
    });
  }

  return list;
}

// Khôi phục dữ liệu từ LocalStorage khi khởi động trang
function loadLocalState() {
  const savedSubjects = sessionStorage.getItem("app_subjects");
  if (savedSubjects) {
    try {
      subjects = JSON.parse(savedSubjects);
      if (subjects.length > 0) {
        // Cập nhật lại ID cao nhất để không bị trùng
        _id = Math.max(...subjects.map((s) => s.id)) + 1;
      }
    } catch (e) {
      console.error("Lỗi khi load subjects:", e);
    }
  }
}

// Lưu dữ liệu mỗi khi có thay đổi
function saveState() {
  sessionStorage.setItem("app_subjects", JSON.stringify(subjects));
  
  // Nếu đang trong quá trình kéo dữ liệu từ đám mây thì không lưu đè lên
  if (typeof isSyncingFromCloud !== "undefined" && isSyncingFromCloud) {
    return;
  }

  // Gọi hàm API nếu nó đã được nạp (trong api.js)
  if (typeof saveDataToBackend === "function") {
    // Để không bị lỗi undefined do load file chưa xong
    if (typeof currentGrades !== "undefined" && typeof currentWeights !== "undefined") {
      saveDataToBackend(subjects, currentGrades, currentWeights);
    }
  }
}

// Chạy khởi tạo
loadLocalState();
