<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="overlay" @click.self="close">
      <div class="modal">
        <div class="modal-hd">
          <span class="modal-title">📂 Nhập môn học từ file Excel</span>
          <button class="modal-close" @click="close">✕</button>
        </div>
        <div class="modal-body">
          <div style="border: 2px dashed var(--gray-300); border-radius: 8px; padding: 24px; text-align: center; background: var(--gray-50); cursor: pointer;" @click="$refs.fileInput.click()">
            <div style="font-size: 36px; margin-bottom: 8px;">📊</div>
            <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 4px;">Tải lên file .xlsx hoặc .xls</div>
            <div style="font-size: 13px; color: var(--gray-500);">Hỗ trợ tự động bóc tách các cột Tên môn, Tín chỉ, Điểm TP1, TP2, Thi</div>
            <input
              ref="fileInput"
              type="file"
              accept=".xlsx, .xls"
              style="display: none;"
              @change="handleFileUpload"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="close">Đóng</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';
import * as XLSX from 'xlsx';
import { parseScore, useGrades } from '../../composables/useGrades';
import { useToast } from '../../composables/useToast';

defineProps({
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'import']);
const fileInput = ref(null);
const { currentGrades, currentWeights } = useGrades();
const { showToast } = useToast();

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

const close = () => emit('close');

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      if (rows.length < 2) {
        showToast('File không có dữ liệu!', 'warning');
        return;
      }

      const hdr = rows[0].map(h => String(h).toLowerCase().replace(/\s+/g, ' ').trim());
      const find = (kws) => {
        for (const kw of kws) {
          const i = hdr.findIndex(h => h.includes(kw));
          if (i >= 0) return i;
        }
        return -1;
      };

      const ci = {
        name: find(['tên môn', 'ten mon', 'môn', 'subject', 'name']),
        sem: find(['kỳ', 'ky', 'học kỳ', 'hk', 'semester']),
        tc: find(['tín', 'tin', 'tín chỉ', 'tc', 'credit']),
        tp1: find(['tp1', 'gk', 'giữa kỳ', 'giua ky', 'midterm']),
        tp2: find(['tp2', 'cc', 'chuyên cần', 'chuyen can']),
        thi: find(['điểm thi', 'diem thi', 'thi', 'final', 'ck']),
        year: find(['năm học', 'nam hoc', 'year'])
      };

      if (ci.name < 0) {
        showToast(
          'Không tìm thấy cột tên môn học!\nHãy đảm bảo file có cột: Tên môn, Tín chỉ, TP1, TP2, Thi',
          'error'
        );
        return;
      }

      const imported = [];
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r[ci.name]) continue;
        imported.push(
          compute({
            namHoc: ci.year >= 0 ? String(r[ci.year] || '') : '',
            hocKy: ci.sem >= 0 ? String(r[ci.sem] || '1') : '1',
            tenMon: String(r[ci.name]),
            tinChi: ci.tc >= 0 ? parseFloat(r[ci.tc]) || 3 : 3,
            tp1: ci.tp1 >= 0 ? (parseScore(r[ci.tp1]) ?? 0) : 0,
            tp2: ci.tp2 >= 0 ? (parseScore(r[ci.tp2]) ?? 0) : 0,
            diemThi: ci.thi >= 0 ? parseScore(r[ci.thi]) : null
          })
        );
      }

      if (!imported.length) {
        showToast('Không tìm thấy dữ liệu hợp lệ!', 'warning');
        return;
      }

      emit('import', imported);
      showToast(`✅ Đã nhập thành công ${imported.length} môn học từ Excel!`, 'success');
      close();
    } catch (err) {
      console.error(err);
      showToast('Lỗi đọc file Excel: ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
};
</script>
