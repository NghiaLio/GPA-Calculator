<template>
  <div>
    <!-- Floating Help Button to replay tour -->
    <button
      class="btn-help"
      title="Xem lại hướng dẫn"
      @click="startTour"
    >
      ?
    </button>

    <!-- Tour Active Elements -->
    <teleport to="body">
      <div v-if="isActive">
        <div class="tour-blocker"></div>
        <div
          class="tour-hole"
          :style="holeStyle"
        ></div>

        <div
          v-if="currentStepData"
          ref="popoverRef"
          class="tour-popover active"
          :style="popoverStyle"
        >
          <div class="tour-title">✨ {{ currentStepData.title }}</div>
          <div class="tour-desc">{{ currentStepData.desc }}</div>
          <div class="tour-footer">
            <div class="tour-dots">
              <div
                v-for="(s, idx) in steps"
                :key="idx"
                :class="['tour-dot', { active: idx === currentStep }]"
              ></div>
            </div>
            <div class="tour-controls">
              <button class="btn btn-outline btn-sm" @click="endTour">Bỏ qua</button>
              <button class="btn btn-primary btn-sm" @click="nextStep">
                {{ currentStep === steps.length - 1 ? 'Hoàn thành' : 'Tiếp theo' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

const TOUR_STEPS = [
  {
    targetId: "btnAddSubject",
    title: "1. Thêm môn học",
    desc: "Bắt đầu bằng cách thêm các môn học của bạn tại đây. Hệ thống sẽ tự động tính toán Điểm quá trình và Điểm học phần.",
    position: "bottom-left"
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
    position: "bottom-left"
  },
  {
    targetId: "btnImportExcel",
    title: "4. Nhập từ Excel",
    desc: "Hoặc nếu bạn có file Excel bảng điểm chuẩn từ trường (.xlsx, .xls), bạn có thể chọn tải tệp lên trực tiếp để hệ thống tự động bóc tách.",
    position: "bottom-left"
  },
  {
    targetId: "statsBar",
    title: "5. Bảng Thống kê",
    desc: "Theo dõi tổng số Tín chỉ, điểm trung bình GPA và kết quả học tập của bạn theo thời gian thực tại đây.",
    position: "bottom-center"
  }
];

const steps = ref(TOUR_STEPS);
const currentStep = ref(0);
const isActive = ref(false);
const popoverRef = ref(null);

const holeStyle = ref({});
const popoverStyle = ref({});

const currentStepData = computed(() => steps.value[currentStep.value]);

onMounted(() => {
  const completed = sessionStorage.getItem("tour_completed");
  if (!completed) {
    setTimeout(() => {
      startTour();
    }, 800);
  }
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition, true);
});

onUnmounted(() => {
  window.removeEventListener('resize', updatePosition);
  window.removeEventListener('scroll', updatePosition, true);
});

const startTour = () => {
  currentStep.value = 0;
  isActive.value = true;
  nextTick(() => {
    renderStep();
  });
};

const renderStep = () => {
  if (currentStep.value >= steps.value.length) {
    endTour();
    return;
  }

  const step = steps.value[currentStep.value];
  const target = document.getElementById(step.targetId);

  if (!target) {
    currentStep.value++;
    renderStep();
    return;
  }

  // Instant scroll to prevent smooth-scroll async race conditions
  target.scrollIntoView({ behavior: 'auto', block: 'center' });

  nextTick(() => {
    updatePosition();
    setTimeout(updatePosition, 50);
    setTimeout(updatePosition, 200);
  });
};

const updatePosition = () => {
  if (!isActive.value || !currentStepData.value) return;

  const target = document.getElementById(currentStepData.value.targetId);
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const padding = 6;

  holeStyle.value = {
    left: `${rect.left - padding}px`,
    top: `${rect.top - padding}px`,
    width: `${rect.width + padding * 2}px`,
    height: `${rect.height + padding * 2}px`
  };

  const popWidth = 340;
  const popHeight = popoverRef.value ? popoverRef.value.getBoundingClientRect().height : 170;
  let popTop = 0;
  let popLeft = 0;
  const margin = 14;

  switch (currentStepData.value.position) {
    case "bottom-left":
      popTop = rect.bottom + margin;
      popLeft = rect.right - popWidth;
      break;
    case "bottom-center":
      popTop = rect.bottom + margin;
      popLeft = rect.left + (rect.width / 2) - (popWidth / 2);
      break;
    case "bottom-right":
      popTop = rect.bottom + margin;
      popLeft = rect.left;
      break;
    case "top-left":
      popTop = rect.top - popHeight - margin;
      popLeft = rect.left;
      break;
    case "top-right":
      popTop = rect.top - popHeight - margin;
      popLeft = rect.right - popWidth;
      break;
    default:
      popTop = rect.bottom + margin;
      popLeft = rect.left;
  }

  // Bound within viewport
  if (popTop + popHeight > window.innerHeight - 10) {
    popTop = rect.top - popHeight - margin;
  }
  if (popTop < 10) {
    popTop = Math.max(10, rect.bottom + margin);
  }

  if (popLeft < 10) popLeft = 10;
  if (popLeft + popWidth > window.innerWidth - 10) {
    popLeft = window.innerWidth - popWidth - 10;
  }

  popoverStyle.value = {
    top: `${popTop}px`,
    left: `${popLeft}px`
  };
};

const nextStep = () => {
  if (currentStep.value >= steps.value.length - 1) {
    endTour();
  } else {
    currentStep.value++;
    renderStep();
  }
};

const endTour = () => {
  sessionStorage.setItem("tour_completed", "true");
  isActive.value = false;
};
</script>
