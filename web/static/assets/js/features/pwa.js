// =================== PWA: CÀI ĐẶT, OFFLINE, ĐỒNG BỘ LẠI ===================

// ---------- Service Worker ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => console.warn("Không đăng ký được service worker:", err));
  });
}

// ---------- Nút "Cài đặt ứng dụng" ----------
let deferredInstallPrompt = null;

function refreshInstallButton() {
  const btn = document.getElementById("btnInstall");
  if (btn) btn.classList.toggle("hidden", !deferredInstallPrompt);
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  refreshInstallButton();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  refreshInstallButton();
  showToast("Đã cài đặt ứng dụng thành công!", "success");
});

async function installApp() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  refreshInstallButton();
}

// ---------- Dữ liệu offline theo từng tài khoản ----------
// Chỉ lưu khi đã đăng nhập, khoá theo UID để không lẫn dữ liệu giữa các tài khoản.
function offlineKey() {
  return typeof currentUser !== "undefined" && currentUser
    ? `app_offline_${currentUser.uid}`
    : null;
}

function cacheOfflineData() {
  const key = offlineKey();
  if (!key) return;
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        subjects,
        scale: currentGrades,
        weights: currentWeights,
        savedAt: Date.now(),
      }),
    );
  } catch (e) {
    /* Bộ nhớ đầy hoặc bị chặn: bỏ qua, không ảnh hưởng chức năng chính */
  }
}

function readOfflineData() {
  const key = offlineKey();
  if (!key) return null;
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch (e) {
    return null;
  }
}

function clearOfflineData() {
  const key = offlineKey();
  if (key) localStorage.removeItem(key);
}

// ---------- Trạng thái mạng ----------
window.addEventListener("offline", () => {
  if (typeof setSyncStatus === "function") setSyncStatus("offline");
  showToast("Bạn đang offline. Thay đổi sẽ được đồng bộ khi có mạng trở lại.", "warning", {
    duration: 4500,
  });
});

window.addEventListener("online", () => {
  showToast("Đã có mạng trở lại", "success");
  if (window.pendingCloudSync && typeof currentUser !== "undefined" && currentUser) {
    saveState(); // đẩy các thay đổi đã thực hiện lúc offline lên đám mây
  } else if (typeof setSyncStatus === "function" && currentUser) {
    setSyncStatus("idle");
  }
});
