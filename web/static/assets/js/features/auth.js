// =================== AUTHENTICATION LOGIC ===================

let currentUser = null;

// Lắng nghe trạng thái đăng nhập
auth.onAuthStateChanged((user) => {
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

    // Load dữ liệu từ Backend
    loadDataFromBackend().then((cloudData) => {
      if (cloudData) {
        if (cloudData.scale) currentGrades = cloudData.scale;
        if (cloudData.weights) currentWeights = cloudData.weights;
        if (cloudData.subjects) {
          subjects = cloudData.subjects;
          _id = Math.max(...subjects.map(s => s.id), 0) + 1;
        }
        
        // Cập nhật lại localStorage theo dữ liệu đám mây
        sessionStorage.setItem("app_grades", JSON.stringify(currentGrades));
        sessionStorage.setItem("app_weights", JSON.stringify(currentWeights));
        sessionStorage.setItem("app_subjects", JSON.stringify(subjects));
        
        renderShell(); // Cập nhật lại toàn bộ DOM
        updateHeaderUserUI(currentUser); // Phục hồi Header
        renderScaleModalUI(); // Nạp lại form thang điểm
        renderAll(); // Nạp lại bảng dữ liệu
        
        showToast("Đã đồng bộ dữ liệu từ đám mây", "success");
      } else {
        // Nếu không có data trên mây (user mới)
        renderShell();
        updateHeaderUserUI(currentUser);
        renderScaleModalUI();
        renderAll();
      }
    });

  } else {
    currentUser = null;
    updateHeaderUserUI(null);
  }
});

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
