// =================== GUIDED TOUR (HIGHLIGHT FOCUS) ===================

const TOUR_STEPS = [
  {
    targetId: "btnAddSubject",
    title: "1. Thêm môn học",
    desc: "Bắt đầu bằng cách thêm các môn học của bạn tại đây. Hệ thống sẽ tự động tính toán Điểm quá trình và Điểm học phần.",
    position: "top-right" // Position of tooltip relative to the hole
  },
  {
    targetId: "btnOpenScaleModal",
    title: "2. Cấu hình Thang điểm",
    desc: "Bấm vào đây để xem và tùy chỉnh Thang điểm (A, B, C...) cũng như Hệ số (Điểm thi, Điểm thành phần) theo quy chế trường bạn.",
    position: "bottom-left"
  },
  {
    targetId: "btnPasteData",
    title: "3. Dán dữ liệu nhanh",
    desc: "Nếu bạn có sẵn bảng điểm trên Excel, chỉ cần Copy và Dán thẳng vào đây để nhập hàng loạt cực kỳ nhanh chóng!",
    position: "top-left"
  },
  {
    targetId: "btnImportExcel",
    title: "4. Nhập từ Excel",
    desc: "Hoặc nếu bạn có file Excel bảng điểm chuẩn từ trường (.xlsx, .xls), bạn có thể chọn tải tệp lên trực tiếp để hệ thống tự động bóc tách.",
    position: "top-left"
  },
  {
    targetId: "syncBtnHeader",
    title: "5. Tự động Đồng bộ",
    desc: "Đừng lo mất dữ liệu! Mọi thay đổi của bạn đều được tự động lưu lên Đám mây. Nút này sẽ hiển thị trạng thái lưu.",
    position: "bottom-left"
  },
  {
    targetId: "statsBar",
    title: "6. Bảng Thống kê",
    desc: "Theo dõi tổng số Tín chỉ, điểm trung bình GPA và kết quả học tập của bạn theo thời gian thực tại đây.",
    position: "bottom-center"
  }
];

let currentTourStep = 0;
let tourOverlay = null;
let tourBlocker = null;
let tourPopover = null;

function startTourIfNeeded() {
  const completed = sessionStorage.getItem("tour_completed");
  if (!completed) {
    // Small delay to ensure all UI is rendered
    setTimeout(() => {
      startTour();
    }, 1000);
  }
}

function startTour() {
  currentTourStep = 0;
  
  // Create Blocker
  tourBlocker = document.createElement("div");
  tourBlocker.className = "tour-blocker";
  document.body.appendChild(tourBlocker);
  
  // Create Hole Overlay
  tourOverlay = document.createElement("div");
  tourOverlay.className = "tour-hole";
  document.body.appendChild(tourOverlay);
  
  // Create Popover
  tourPopover = document.createElement("div");
  tourPopover.className = "tour-popover";
  document.body.appendChild(tourPopover);
  
  window.addEventListener("resize", updateTourPosition);
  
  renderTourStep();
}

function renderTourStep() {
  if (currentTourStep >= TOUR_STEPS.length) {
    endTour();
    return;
  }
  
  const step = TOUR_STEPS[currentTourStep];
  const target = document.getElementById(step.targetId);
  
  if (!target) {
    // Fallback if element not found
    currentTourStep++;
    renderTourStep();
    return;
  }
  
  // Scroll target into view if needed
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  
  setTimeout(() => {
    updateTourPosition();
    
    // Build Popover Content
    let dotsHtml = "";
    for (let i = 0; i < TOUR_STEPS.length; i++) {
      dotsHtml += `<div class="tour-dot ${i === currentTourStep ? "active" : ""}"></div>`;
    }
    
    tourPopover.innerHTML = `
      <div class="tour-title">✨ ${step.title}</div>
      <div class="tour-desc">${step.desc}</div>
      <div class="tour-footer">
        <div class="tour-dots">${dotsHtml}</div>
        <div class="tour-controls">
          <button class="btn btn-outline btn-sm" onclick="endTour()">Bỏ qua</button>
          <button class="btn btn-primary btn-sm" onclick="nextTourStep()">${currentTourStep === TOUR_STEPS.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}</button>
        </div>
      </div>
    `;
    
    tourPopover.classList.add("active");
  }, 300); // Wait for scroll
}

function updateTourPosition() {
  if (currentTourStep >= TOUR_STEPS.length || !tourOverlay || !tourPopover) return;
  
  const step = TOUR_STEPS[currentTourStep];
  const target = document.getElementById(step.targetId);
  if (!target) return;
  
  const rect = target.getBoundingClientRect();
  
  // Update Hole Position (add some padding around the element)
  const padding = 8;
  tourOverlay.style.left = `${rect.left - padding}px`;
  tourOverlay.style.top = `${rect.top - padding}px`;
  tourOverlay.style.width = `${rect.width + padding * 2}px`;
  tourOverlay.style.height = `${rect.height + padding * 2}px`;
  
  // Update Popover Position
  const popoverRect = tourPopover.getBoundingClientRect();
  const popWidth = 320; // fixed width from css
  let popTop = 0;
  let popLeft = 0;
  const margin = 16;
  
  switch (step.position) {
    case "bottom-left":
      popTop = rect.bottom + margin;
      popLeft = rect.right - popWidth;
      break;
    case "bottom-center":
      popTop = rect.bottom + margin;
      popLeft = rect.left + (rect.width / 2) - (popWidth / 2);
      break;
    case "top-left":
      popTop = rect.top - popoverRect.height - margin;
      if (popTop < 0) popTop = rect.bottom + margin; // Fallback
      popLeft = rect.left;
      break;
    case "top-right":
      popTop = rect.top - popoverRect.height - margin;
      if (popTop < 0) popTop = rect.bottom + margin;
      popLeft = rect.right - popWidth;
      break;
    default:
      popTop = rect.bottom + margin;
      popLeft = rect.left;
  }
  
  // Constrain to viewport
  if (popLeft < 10) popLeft = 10;
  if (popLeft + popWidth > window.innerWidth - 10) popLeft = window.innerWidth - popWidth - 10;
  
  tourPopover.style.top = `${popTop}px`;
  tourPopover.style.left = `${popLeft}px`;
}

function nextTourStep() {
  tourPopover.classList.remove("active");
  currentTourStep++;
  setTimeout(() => {
    renderTourStep();
  }, 200); // small delay for fade out
}

function endTour() {
  sessionStorage.setItem("tour_completed", "true");
  if (tourOverlay) tourOverlay.remove();
  if (tourBlocker) tourBlocker.remove();
  if (tourPopover) tourPopover.remove();
  window.removeEventListener("resize", updateTourPosition);
  tourOverlay = null;
  tourBlocker = null;
  tourPopover = null;
  
  // Hiển thị popup đăng nhập sau khi tour kết thúc (nếu cần)
  if (typeof checkLoginPrompt === "function") {
    checkLoginPrompt();
  }
}

// Hàm được gọi bởi nút ? ở góc màn hình
function replayTour() {
  endTour(); // clear existing if any
  startTour();
}
