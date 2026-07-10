// =================== CONFIRM MODAL ===================

function confirmModalTemplate() {
  return `
    <div
      id="confirmModal"
      class="overlay hidden"
      style="z-index: 10000;"
    >
      <div class="modal" style="max-width: 400px; text-align: center; padding: 24px;">
        <div style="font-size: 32px; margin-bottom: 16px;">⚠️</div>
        <h3 id="confirmTitle" style="margin-top: 0; color: var(--gray-800); font-size: 18px;">Xác nhận</h3>
        <p id="confirmMessage" style="color: var(--gray-500); font-size: 14px; margin-bottom: 24px; line-height: 1.5;"></p>
        
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-outline" id="confirmCancelBtn" style="flex: 1; justify-content: center;">Hủy</button>
          <button class="btn btn-danger" id="confirmOkBtn" style="flex: 1; justify-content: center;">Đồng ý</button>
        </div>
      </div>
    </div>
  `;
}

function showConfirm(message, title = "Xác nhận") {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirmModal");
    if (!modal) return resolve(false);
    
    document.getElementById("confirmTitle").innerText = title;
    document.getElementById("confirmMessage").innerHTML = message;
    
    modal.classList.remove("hidden");
    
    const cancelBtn = document.getElementById("confirmCancelBtn");
    const okBtn = document.getElementById("confirmOkBtn");
    
    // Cleanup handlers
    const cleanup = () => {
      cancelBtn.onclick = null;
      okBtn.onclick = null;
      modal.classList.add("hidden");
    };
    
    cancelBtn.onclick = () => {
      cleanup();
      resolve(false);
    };
    
    okBtn.onclick = () => {
      cleanup();
      resolve(true);
    };
  });
}
