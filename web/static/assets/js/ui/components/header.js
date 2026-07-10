function headerTemplate() {
  return `<!-- ===== HEADER ===== -->
    <div class="header">
      <div class="header-left">
        <h1>📊 Bảng Điểm Học Tập</h1>
        <p>
          Quản lý điểm & tính GPA theo thang điểm 4 | Tự động tính ĐQT · Điểm HP
          · Điểm chữ
        </p>
      </div>
      <div class="header-right">
        <div id="userProfile" class="hidden" style="display: flex; align-items: center; gap: 8px; margin-right: 12px; background: white; padding: 4px 12px 4px 4px; border-radius: 20px; border: 1px solid var(--gray-200);">
          <img id="userAvatar" src="" style="width: 28px; height: 28px; border-radius: 50%;">
          <span id="userName" style="font-size: 13px; font-weight: 500; color: var(--gray-700);"></span>
          <button onclick="logoutFirebase()" style="background: none; border: none; color: var(--red); font-weight: 600; font-size: 13px; cursor: pointer; padding: 0 8px; border-left: 1px solid var(--gray-200); margin-left: 4px;">Thoát</button>
        </div>
        <button id="loginBtnHeader" class="btn btn-outline btn-header hidden" style="margin-right: 12px; display: none;" onclick="document.getElementById('loginModal').classList.remove('hidden')">
          ☁️ Đăng nhập
        </button>
        <div id="syncBtnHeader" class="btn btn-outline btn-header hidden" style="margin-right: 12px; background-color: var(--blue-bg); color: var(--blue); border-color: var(--blue); cursor: default; pointer-events: none;">
          ☁️ Đã đồng bộ
        </div>
        <button
          id="btnOpenScaleModal"
          class="btn btn-outline btn-header"
          onclick="openScaleModal()"
        >
          📋 Thang điểm
        </button>
        <button
          class="btn btn-outline btn-header"
          onclick="exportToExcel()"
        >
          ⬇ Xuất Excel
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
      syncBtn.style.display = "flex";
    }
    
    document.getElementById("userAvatar").src = user.photoURL || "https://ui-avatars.com/api/?name=" + user.email;
    document.getElementById("userName").textContent = user.displayName || user.email.split("@")[0];
  } else {
    profileDiv.classList.add("hidden");
    profileDiv.style.display = "none";
    loginBtn.classList.remove("hidden");
    loginBtn.style.display = "flex";
    if (syncBtn) {
      syncBtn.classList.add("hidden");
      syncBtn.style.display = "none";
    }
  }
}

// Nút lưu thủ công đã bị loại bỏ vì hệ thống sử dụng Auto-save hoàn toàn.

let syncTimeout = null;
function setSyncStatus(status) {
  const btn = document.getElementById("syncBtnHeader");
  if (!btn) return;
  
  if (syncTimeout) {
    clearTimeout(syncTimeout);
    syncTimeout = null;
  }
  
  btn.style.transition = "all 0.3s ease";
  
  if (status === "saving") {
    btn.innerHTML = "⏳ Đang lưu...";
    btn.style.backgroundColor = "var(--gray-100)";
    btn.style.color = "var(--gray-500)";
    btn.style.borderColor = "var(--gray-300)";
    btn.disabled = true;
  } else if (status === "success") {
    btn.innerHTML = "✅ Đã lưu";
    btn.style.backgroundColor = "#dcfce7"; // bg-green-100
    btn.style.color = "#166534"; // text-green-800
    btn.style.borderColor = "#86efac"; // border-green-300
    btn.disabled = false;
    
    // Tự động trở về trạng thái gốc sau 2.5s
    syncTimeout = setTimeout(() => {
      setSyncStatus("idle");
    }, 2500);
  } else if (status === "error") {
    btn.innerHTML = "❌ Lỗi lưu";
    btn.style.backgroundColor = "#fee2e2"; // bg-red-100
    btn.style.color = "#991b1b"; // text-red-800
    btn.style.borderColor = "#fca5a5"; // border-red-300
    btn.disabled = false;
  } else {
    // Trạng thái idle
    btn.innerHTML = "☁️ Đã đồng bộ";
    btn.style.backgroundColor = "var(--blue-bg)";
    btn.style.color = "var(--blue)";
    btn.style.borderColor = "var(--blue)";
  }
}
