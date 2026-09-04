<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="overlay" @click.self="close">
      <div class="modal modal-lg">
        <div class="modal-hd">
          <span class="modal-title">📋 Dán dữ liệu từ Excel / Word</span>
          <button class="modal-close" @click="close">✕</button>
        </div>
        <div class="modal-body">
          <div class="paste-instructions">
            <p>📌 <strong>Định dạng hỗ trợ (Tab hoặc Dấu phẩy):</strong></p>
            <code>Tên môn | Học kỳ | Tín chỉ | TP1 (Giữa kỳ) | TP2 (Chuyên cần) | Điểm thi</code>
          </div>
          <textarea
            v-model="pasteText"
            class="paste-textarea"
            placeholder="Dán (Ctrl+V) các dòng dữ liệu vào đây..."
            rows="6"
            @input="onInput"
          ></textarea>

          <div v-if="previewRows.length" class="paste-preview-wrap">
            <div class="preview-header">
              <span>Tìm thấy <strong>{{ previewRows.length }}</strong> môn học hợp lệ</span>
              <span v-if="hasWarn" class="warn-badge">⚠️ Một số môn tự động nhận 3 tín chỉ</span>
            </div>
            <table class="tbl tbl-sm">
              <thead>
                <tr>
                  <th style="text-align:left">Môn học</th>
                  <th>Tín chỉ</th>
                  <th>TP1</th>
                  <th>TP2</th>
                  <th>ĐQT</th>
                  <th>Điểm thi</th>
                  <th>Điểm HP</th>
                  <th>Điểm chữ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, idx) in previewRows" :key="idx" :class="{ 'warn-row': s._warn }">
                  <td style="text-align:left">{{ s.tenMon }}</td>
                  <td>{{ s.tinChi }} {{ s._warn ? '⚠️' : '' }}</td>
                  <td :style="{ color: sColor(s.tp1) }">{{ fmt(s.tp1) }}</td>
                  <td :style="{ color: sColor(s.tp2) }">{{ fmt(s.tp2) }}</td>
                  <td :style="{ color: sColor(s.dqt) }">{{ fmt(s.dqt) }}</td>
                  <td :style="{ color: s.diemThi !== null ? sColor(s.diemThi) : '#9ca3af' }">
                    {{ s.diemThi !== null ? fmt(s.diemThi) : '—' }}
                  </td>
                  <td :style="{ color: s.diemHP !== null ? sColor(s.diemHP) : '#9ca3af' }">
                    {{ s.diemHP !== null ? fmt(s.diemHP) : '—' }}
                  </td>
                  <td>
                    <span
                      v-if="s.diemChu"
                      class="letter-badge"
                      :style="{ color: lColor(s.diemChu), background: lBg(s.diemChu) }"
                    >
                      {{ s.diemChu }}
                    </span>
                    <span v-else>—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="close">Hủy</button>
          <button
            class="btn btn-primary"
            :disabled="!previewRows.length"
            @click="confirm"
          >
            ✅ Thêm {{ previewRows.length }} môn
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { parseScore, useGrades } from '../../composables/useGrades';
import { useToast } from '../../composables/useToast';

defineProps({
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'import']);
const { currentGrades, currentWeights } = useGrades();
const { showToast } = useToast();

const pasteText = ref('');
const previewRows = ref([]);

const hasWarn = computed(() => previewRows.value.some(r => r._warn));

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

function fmt(v) {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  return isNaN(n) ? '—' : n.toFixed(1);
}

function compute(r) {
  const tp1 = parseScore(r.tp1) ?? 0;
  const tp2 = parseScore(r.tp2) ?? 0;
  const thi = parseScore(r.diemThi);
  const dqt = +(tp1 * currentWeights.value.tp1 + tp2 * currentWeights.value.tp2).toFixed(2);
  if (thi === null) {
    return { ...r, tp1, tp2, dqt, diemHP: null, diemChu: null, s4: null, rank: null };
  }
  const hp = +(dqt * currentWeights.value.dqt + thi * currentWeights.value.thi).toFixed(2);
  let g = currentGrades.value[currentGrades.value.length - 1];
  for (const gradeObj of currentGrades.value) {
    if (hp >= gradeObj.min) {
      g = gradeObj;
      break;
    }
  }
  return { ...r, tp1, tp2, dqt, diemHP: hp, diemChu: g.letter, s4: g.s4, rank: g.rank };
}

function onInput() {
  if (!pasteText.value.trim()) {
    previewRows.value = [];
    return;
  }
  const lines = pasteText.value
    .trim()
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !/^(#|stt|môn học|môn thi|subject)/i.test(l));

  const results = [];
  for (const line of lines) {
    const sep = line.includes('\t') ? '\t' : ',';
    const cols = line.split(sep).map(c => c.trim());
    if (cols.length < 4) continue;

    let s = null;
    const yearIdx = cols.findIndex(c => /^\d{4}-\d{4}$/.test(c));
    if (yearIdx >= 0 && cols.length >= yearIdx + 7) {
      const base = yearIdx;
      s = {
        namHoc: cols[base],
        hocKy: cols[base + 1],
        tenMon: cols[base + 2],
        tinChi: 3,
        tp1: parseScore(cols[base + 4]),
        tp2: parseScore(cols[base + 5]),
        diemThi: parseScore(cols[base + 7]),
        _warn: true
      };
    } else if (cols.length >= 6 && !isNaN(parseFloat(cols[2]))) {
      s = {
        namHoc: cols[6] || '',
        hocKy: cols[1] || '1',
        tenMon: cols[0],
        tinChi: parseFloat(cols[2]) || 3,
        tp1: parseScore(cols[3]),
        tp2: parseScore(cols[4]),
        diemThi: parseScore(cols[5])
      };
    } else {
      s = {
        tenMon: cols[0],
        tinChi: parseFloat(cols[1]) || 3,
        tp1: parseScore(cols[2]),
        tp2: parseScore(cols[3]),
        diemThi: parseScore(cols[4])
      };
    }
    if (s && s.tenMon) {
      s.tp1 = s.tp1 ?? 0;
      s.tp2 = s.tp2 ?? 0;
      results.push(compute(s));
    }
  }
  previewRows.value = results;
}

const close = () => {
  pasteText.value = '';
  previewRows.value = [];
  emit('close');
};

const confirm = () => {
  if (!previewRows.value.length) return;
  emit('import', previewRows.value);
  showToast(`✅ Đã thêm ${previewRows.value.length} môn học từ dữ liệu dán!`, 'success');
  close();
};
</script>
