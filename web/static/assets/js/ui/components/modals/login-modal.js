// =================== LOGIN MODAL ===================

function loginModalTemplate() {
  return `
    <div
      id="loginModal"
      class="overlay hidden"
      style="z-index: 9999;"
    >
      <div class="modal" style="max-width: 420px; text-align: center; padding: 30px 24px;">
        <div style="font-size: 48px; margin-bottom: 20px;">☁️</div>
        <h3 style="margin-top: 0; color: var(--gray-800); font-size: 20px; font-weight: 700;">Đồng bộ dữ liệu học tập</h3>
        
        <p style="color: var(--gray-500); font-size: 14px; margin-bottom: 24px; line-height: 1.6;">
          Đăng nhập để <strong>lưu lại vĩnh viễn</strong> toàn bộ bảng điểm, cấu hình thang điểm và công thức của bạn lên đám mây.<br/><br/>
          <em>Nếu tiếp tục mà không đăng nhập, kết quả sẽ không được lưu và bạn sẽ phải tải lên lại dữ liệu vào lần truy cập sau.</em>
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button 
            class="btn" 
            style="justify-content: center; background: white; color: #3c4043; border: 1px solid #dadce0; box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3); padding: 12px;"
            onclick="handleGoogleLogin()"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" style="width: 18px; height: 18px; margin-right: 10px;">
            Đăng nhập với Google
          </button>
          
          <button 
            class="btn btn-outline" 
            style="justify-content: center; border: none; color: var(--gray-400);"
            onclick="skipLogin()"
          >
            Tiếp tục không đăng nhập
          </button>
        </div>
      </div>
    </div>
  `;
}

function handleGoogleLogin() {
  loginWithGoogle();
}

function skipLogin() {
  closeModal('loginModal');
  sessionStorage.setItem("skip_login_prompt", "true");
}

function checkLoginPrompt() {
  const skipped = sessionStorage.getItem("skip_login_prompt");
  const tourDone = sessionStorage.getItem("tour_completed");
  
  if (!skipped) {
    // Nếu chưa xem xong tour hướng dẫn thì hoãn lại, đợi tour gọi
    if (!tourDone) return;
    
    setTimeout(() => {
      document.getElementById("loginModal").classList.remove("hidden");
    }, 500); // Hiện nhanh hơn sau khi tour kết thúc
  }
}
