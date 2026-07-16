// =================== STATE ===================
let _id = 1;
const uid = () => _id++;

let subjects = [];
let editingId = null;
let pasteRows = [];

// Trạng thái cho Search & Sort
let searchQuery = "";
let sortMode = "default"; // default, name_asc, name_desc, hp_desc, hp_asc, tc_desc

function setFilterSearch(query) {
  searchQuery = (query || "").toLowerCase().trim();
}

function setFilterSort(mode) {
  sortMode = mode || "default";
}

function getProcessedSubjects() {
  let list = [...subjects];

  // Lọc theo tìm kiếm
  if (searchQuery !== "") {
    list = list.filter(s => (s.tenMon || "").toLowerCase().includes(searchQuery));
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
        return (a.tenMon || "").localeCompare(b.tenMon || "");
      }
      if (sortMode === "name_desc") {
        return (b.tenMon || "").localeCompare(a.tenMon || "");
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
