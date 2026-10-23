// =================== TOAST NOTIFICATIONS ===================

function initToastContainer() {
  if (!document.getElementById("toast-container")) {
    const container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
}

function showToast(message, type = "success", opts = {}) {
  initToastContainer();
  const container = document.getElementById("toast-container");
  
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "💡";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "❌";
  if (type === "warning") icon = "⚠️";
  
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  const dismiss = () => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300); // Wait for transition
  };

  // Nút hành động tuỳ chọn (VD: Hoàn tác)
  if (opts.action) {
    const btn = document.createElement("button");
    btn.className = "toast-action";
    btn.textContent = opts.action.label;
    btn.onclick = () => {
      opts.action.onClick();
      dismiss();
    };
    toast.insertBefore(btn, toast.querySelector(".toast-close"));
  }
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);
  
  // Auto remove (mặc định sau 3 giây)
  setTimeout(dismiss, opts.duration || 3000);
}
