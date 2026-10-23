function headerTemplate() {
  return `<!-- ===== HEADER ===== -->
    <div class="header">
      <div class="header-left">
        <h1>📊 Bảng Điểm Học Tập</h1>
        <p>
          Quản lý điểm & tính GPA theo thang điểm 4 | Tự động tính ĐQT · Điểm HP · Điểm chữ
        </p>
      </div>
      <div class="header-right">
        <div id="userProfile" class="hidden user-profile">
          <img id="userAvatar" src="" alt="Avatar">
          <span id="userName"></span>
          <button onclick="logoutFirebase()" class="btn-logout" title="Đăng xuất khỏi tài khoản">Thoát</button>
        </div>
        <button id="loginBtnHeader" class="btn btn-outline btn-header hidden" onclick="document.getElementById('loginModal').classList.remove('hidden')">
          ☁️ Đăng nhập
        </button>
        <div id="syncBtnHeader" class="btn btn-outline btn-header sync-badge hidden">
          ☁️ Đã đồng bộ
        </div>
        <button
          id="btnTheme"
          class="btn btn-outline btn-header btn-icon"
          onclick="toggleTheme()"
          title="Đổi giao diện sáng / tối"
          aria-label="Đổi giao diện sáng tối"
        >
          🌙
        </button>
        <button
          id="btnTools"
          class="btn btn-outline btn-header"
          onclick="openToolsModal()"
          title="Mở bộ công cụ: Mục tiêu GPA, Mô phỏng điểm, Tiến độ & Lịch sử"
        >
          🧮 Công cụ
        </button>
        <div class="dropdown">
          <button
            id="btnExport"
            class="btn btn-outline btn-header"
            onclick="toggleExportMenu(event)"
            title="Xuất bảng điểm sang Excel, PDF hoặc ảnh"
            aria-expanded="false"
          >
            ⬇ Xuất ▾
          </button>
          <div id="exportMenu" class="dropdown-menu hidden">
            <button class="dropdown-item" onclick="exportToExcel(); closeExportMenu();">
              <span>📊</span>
              <div>
                <strong>Xuất Excel (.xlsx)</strong>
                <small>Bảng tính đầy đủ công thức & học kỳ</small>
              </div>
            </button>
            <button class="dropdown-item" onclick="exportPdf(); closeExportMenu();">
              <span>📄</span>
              <div>
                <strong>In / Xuất PDF</strong>
                <small>Bản in đẹp gọn gàng để nộp hoặc lưu trữ</small>
              </div>
            </button>
            <button class="dropdown-item" onclick="exportImage(); closeExportMenu();">
              <span>🖼️</span>
              <div>
                <strong>Xuất ảnh PNG</strong>
                <small>Tạo ảnh nét để chia sẻ hoặc xem trên điện thoại</small>
              </div>
            </button>
          </div>
        </div>
        <button
          id="btnOpenScaleModal"
          class="btn btn-outline btn-header"
          onclick="openScaleModal()"
          title="Xem & tuỳ chỉnh thang điểm 4, điểm chữ và trọng số"
        >
          📋 Thang điểm
        </button>
        <button
          id="btnInstall"
          class="btn btn-outline btn-header hidden"
          onclick="installApp()"
          title="Cài đặt Bảng Điểm Học Tập lên máy tính / điện thoại"
        >
          📲 Cài đặt app
        </button>
      </div>
    </div>`;
}

function updateHeaderUserUI(user) {
  const profileDiv = document.getElementById("userProfile");
  const loginBtn = document.getElementById("loginBtnHeader");
  const syncBtn = document.getElementById("syncBtnHeader");
  if (!profileDiv || !loginBtn) return;
  
  if (user) {
    profileDiv.classList.remove("hidden");
    profileDiv.style.display = "flex";
    loginBtn.classList.add("hidden");
    loginBtn.style.display = "none";
    if (syncBtn) {
      syncBtn.classList.remove("hidden");
      syncBtn.style.display = "inline-flex";
    }
    
    document.getElementById("userAvatar").src = user.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.email);
    document.getElementById("userName").textContent = user.displayName || user.email.split("@")[0];
  } else {
    profileDiv.classList.add("hidden");
    profileDiv.style.display = "none";
    loginBtn.classList.remove("hidden");
    loginBtn.style.display = "inline-flex";
    if (syncBtn) {
      syncBtn.classList.add("hidden");
      syncBtn.style.display = "none";
    }
  }
}

let syncTimeout = null;
function setSyncStatus(status) {
  const btn = document.getElementById("syncBtnHeader");
  if (!btn) return;
  
  if (syncTimeout) {
    clearTimeout(syncTimeout);
    syncTimeout = null;
  }
  
  btn.style.transition = "all 0.3s ease";
  
  if (status === "loading") {
    btn.innerHTML = "⏳ Đang tải...";
    btn.style.backgroundColor = "var(--gray-100)";
    btn.style.color = "var(--gray-500)";
    btn.style.borderColor = "var(--gray-300)";
    btn.disabled = true;
  } else if (status === "saving") {
    btn.innerHTML = "⏳ Đang lưu...";
    btn.style.backgroundColor = "var(--gray-100)";
    btn.style.color = "var(--gray-500)";
    btn.style.borderColor = "var(--gray-300)";
    btn.disabled = true;
  } else if (status === "success") {
    btn.innerHTML = "✅ Đã lưu";
    btn.style.backgroundColor = "var(--green-bg)";
    btn.style.color = "var(--green)";
    btn.style.borderColor = "var(--green)";
    btn.disabled = false;
    
    // Tự động trở về trạng thái gốc sau 2.5s
    syncTimeout = setTimeout(() => {
      setSyncStatus("idle");
    }, 2500);
  } else if (status === "error") {
    btn.innerHTML = "❌ Lỗi lưu";
    btn.style.backgroundColor = "var(--red-bg)";
    btn.style.color = "var(--red)";
    btn.style.borderColor = "var(--red)";
    btn.disabled = false;
  } else if (status === "offline") {
    btn.innerHTML = "📡 Offline (lưu máy)";
    btn.style.backgroundColor = "var(--amber-bg)";
    btn.style.color = "var(--amber)";
    btn.style.borderColor = "var(--amber)";
    btn.disabled = false;
  } else {
    // Trạng thái idle
    btn.innerHTML = "☁️ Đã đồng bộ";
    btn.style.backgroundColor = "var(--blue-bg)";
    btn.style.color = "var(--blue)";
    btn.style.borderColor = "var(--blue)";
    btn.disabled = false;
  }
}

