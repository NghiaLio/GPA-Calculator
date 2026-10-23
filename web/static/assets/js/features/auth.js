// =================== AUTHENTICATION LOGIC ===================

let currentUser = null;
let isSyncingFromCloud = false;

// Lắng nghe trạng thái đăng nhập
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    // Đóng popup đăng nhập nếu đang mở
    closeModal("loginModal");
    
    // Lưu session token hoặc email để sử dụng nếu cần
    console.log("Logged in as:", user.email);
    
    // Cập nhật giao diện Header (được định nghĩa trong header.js)
    updateHeaderUserUI(user);
    
    // Tự động ẩn popup yêu cầu đăng nhập nếu người dùng F5
    sessionStorage.setItem("skip_login_prompt", "true");

    // Đánh dấu cờ đang kéo dữ liệu từ đám mây về để tránh trigger lưu ngược lên
    isSyncingFromCloud = true;
    if (typeof setSyncStatus === "function") {
      setSyncStatus("loading");
    }

    try {
      // Ưu tiên pull dữ liệu từ Backend / Firestore về trước (ném lỗi nếu thất bại)
      const cloudData = await loadDataFromBackend();

      if (cloudData && (cloudData.subjects?.length > 0 || cloudData.scale || cloudData.weights)) {
        // Có dữ liệu trên đám mây -> Nạp vào state
        applyUserData(cloudData);
        clearHistory(); // dữ liệu cũ trước khi đồng bộ không còn ý nghĩa để hoàn tác
        cacheOfflineData();

        showToast("Đã đồng bộ dữ liệu từ đám mây", "success");
        if (typeof setSyncStatus === "function") {
          setSyncStatus("idle");
        }
      } else {
        // Nếu không có data trên mây (user mới)
        renderShell();
        updateHeaderUserUI(currentUser);
        renderScaleModalUI();
        renderAll();

        // Nếu user đã nhập sẵn môn học ở máy trước khi đăng nhập, tự động đồng bộ lần đầu lên cloud
        if (subjects && subjects.length > 0) {
          console.log("Phát hiện dữ liệu local, tự động lưu lên Firestore lần đầu...");
          isSyncingFromCloud = false; // Mở cờ để cho phép save
          saveState();
        } else {
          if (typeof setSyncStatus === "function") {
            setSyncStatus("idle");
          }
        }
      }
    } catch (err) {
      console.error("Lỗi khi kéo dữ liệu lúc đăng nhập:", err);

      // Không kết nối được máy chủ: dùng bản dữ liệu đã lưu trên thiết bị (nếu có)
      const cached = readOfflineData();
      if (cached && (cached.subjects?.length > 0 || cached.scale || cached.weights)) {
        applyUserData(cached);
        clearHistory();
        window.pendingCloudSync = false;
        showToast(
          "Không kết nối được máy chủ. Đang dùng dữ liệu đã lưu trên thiết bị.",
          "warning",
          { duration: 5000 },
        );
        if (typeof setSyncStatus === "function") {
          setSyncStatus(navigator.onLine ? "error" : "offline");
        }
      } else if (typeof setSyncStatus === "function") {
        setSyncStatus(navigator.onLine ? "error" : "offline");
      }
    } finally {
      isSyncingFromCloud = false;
    }

  } else {
    currentUser = null;
    updateHeaderUserUI(null);
  }
});

// Nạp dữ liệu người dùng (từ đám mây hoặc bản offline) vào state và vẽ lại giao diện
function applyUserData(data) {
  if (data.scale) currentGrades = data.scale;
  if (data.weights) currentWeights = data.weights;
  if (data.subjects) {
    subjects = data.subjects;
    _id = Math.max(...subjects.map((s) => s.id), 0) + 1;
  }

  // Cập nhật lại sessionStorage theo dữ liệu nạp vào
  sessionStorage.setItem("app_grades", JSON.stringify(currentGrades));
  sessionStorage.setItem("app_weights", JSON.stringify(currentWeights));
  sessionStorage.setItem("app_subjects", JSON.stringify(subjects));

  renderShell(); // Cập nhật lại toàn bộ DOM
  updateHeaderUserUI(currentUser); // Phục hồi Header
  renderScaleModalUI(); // Nạp lại form thang điểm
  renderAll(); // Nạp lại bảng dữ liệu
}

// Hàm gọi đăng nhập Google
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  
  // Tùy chọn: Có thể cấu hình popup để luôn buộc chọn tài khoản
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  auth.signInWithPopup(provider)
    .then((result) => {
      showToast("Đăng nhập thành công!", "success");
    })
    .catch((error) => {
      console.error("Lỗi đăng nhập:", error);
      showToast("Đăng nhập thất bại: " + error.message, "error");
    });
}

// Hàm Đăng xuất
function logoutFirebase() {
  auth.signOut()
    .then(() => {
      showToast("Đã đăng xuất!", "success");
      // Optional: Refresh trang hoặc xóa dữ liệu trên màn hình
      // window.location.reload();
    })
    .catch((error) => {
      showToast("Lỗi đăng xuất: " + error.message, "error");
    });
}
