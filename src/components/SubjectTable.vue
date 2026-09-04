<template>
  <div class="main">
    <Transition name="fade" mode="out-in">
      <div v-if="!subjects.length" key="empty" class="empty">
        <div class="empty-icon">📚</div>
        <p>Chưa có dữ liệu môn học.</p>
        <div class="hint">Hãy thêm môn học thủ công hoặc nhập từ Excel / dán dữ liệu.</div>
      </div>

      <div v-else key="table" class="semester-card">
        <table class="tbl">
          <thead>
            <tr>
              <th class="center" style="width: 36px">#</th>
              <th>Môn học</th>
              <th class="center">Tín chỉ</th>
              <th class="center" title="Điểm giữa kỳ">GK (TP1)</th>
              <th class="center" title="Điểm chuyên cần">CC (TP2)</th>
              <th class="center" title="Điểm quá trình = TP1×0.7 + TP2×0.3">ĐQT</th>
              <th class="center" title="Điểm thi cuối kỳ">Điểm thi</th>
              <th class="center" title="Điểm học phần = ĐQT×0.3 + Điểm thi×0.7">Điểm HP</th>
              <th class="center">Điểm chữ</th>
              <th class="center" style="width: 72px">Thao tác</th>
            </tr>
          </thead>
          <TransitionGroup name="table-row" tag="tbody">
            <tr v-for="(s, i) in subjects" :key="s.id || i" class="table-row-item">
              <td class="center" style="color: #d1d5db; font-size: 12px">{{ i + 1 }}</td>
              <td>
                <span class="subject-name">{{ s.tenMon }}</span>
              </td>
              <td class="center">
                <span class="tc-badge">{{ s.tinChi }}</span>
              </td>
              <td class="center">
                <span class="score" :style="{ color: sColor(s.tp1) }">{{ fmt(s.tp1) }}</span>
              </td>
              <td class="center">
                <span class="score" :style="{ color: sColor(s.tp2) }">{{ fmt(s.tp2) }}</span>
              </td>
              <td class="center">
                <span class="score" :style="{ color: sColor(s.dqt) }">{{ fmt(s.dqt) }}</span>
              </td>
              <td class="center">
                <span v-if="s.diemThi !== null && s.diemThi !== undefined" class="score" :style="{ color: sColor(s.diemThi) }">
                  {{ fmt(s.diemThi) }}
                </span>
                <span v-else class="score-dash">Chưa thi</span>
              </td>
              <td class="center">
                <span v-if="s.diemHP !== null && s.diemHP !== undefined" class="score" :style="{ color: sColor(s.diemHP) }">
                  {{ fmt(s.diemHP) }}
                </span>
                <span v-else class="score-dash">—</span>
              </td>
              <td class="center">
                <span
                  v-if="s.diemChu"
                  class="letter-badge"
                  :style="{ color: lColor(s.diemChu), background: lBg(s.diemChu) }"
                >
                  {{ s.diemChu }}
                </span>
                <span v-else class="score-dash">—</span>
              </td>
              <td class="center">
                <div class="row-actions">
                  <button class="icon-btn edit" title="Chỉnh sửa" @click="$emit('edit', s)">✏️</button>
                  <button class="icon-btn del" title="Xóa" @click="$emit('delete', s.id)">🗑️</button>
                </div>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </Transition>
  </div>
</template>

<script setup>
defineProps({
  subjects: { type: Array, required: true }
});

defineEmits(['edit', 'delete']);

function sColor(v) {
  const n = parseFloat(v);
  if (isNaN(n)) return "#9ca3af";
  if (n >= 8.5) return "#16a34a";
  if (n >= 7.0) return "#2563eb";
  if (n >= 5.5) return "#d97706";
  return "#dc2626";
}

function lColor(l) {
  if (!l) return "#9ca3af";
  if (["A+", "A"].includes(l)) return "#16a34a";
  if (["B+", "B"].includes(l)) return "#2563eb";
  if (["C+", "C"].includes(l)) return "#d97706";
  if (["D+", "D"].includes(l)) return "#ea580c";
  return "#dc2626";
}

function lBg(l) {
  if (!l) return "#f3f4f6";
  if (["A+", "A"].includes(l)) return "#dcfce7";
  if (["B+", "B"].includes(l)) return "#dbeafe";
  if (["C+", "C"].includes(l)) return "#fef3c7";
  if (["D+", "D"].includes(l)) return "#ffedd5";
  return "#fee2e2";
}

function fmt(v, d = 1) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(d);
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.table-row-enter-active,
.table-row-leave-active {
  transition: all 0.3s ease;
}

.table-row-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.table-row-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.table-row-move {
  transition: transform 0.3s ease;
}
</style>
