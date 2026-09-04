<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="overlay" @click.self="close">
      <!-- VIEW SCALE MODE -->
      <div v-if="!isEditing" class="modal modal-scale">
        <div class="modal-hd">
          <span class="modal-title">📋 Thang điểm quy đổi</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn-outline btn-sm" @click="isEditing = true">
              ✏️ Chỉnh sửa
            </button>
            <button class="modal-close" @click="close">✕</button>
          </div>
        </div>
        <div class="modal-body">
          <div style="overflow-x: auto;">
            <table class="scale-tbl">
              <thead>
                <tr>
                  <th style="white-space: nowrap">Thang 10</th>
                  <th style="white-space: nowrap">Thang 4</th>
                  <th style="white-space: nowrap">Điểm chữ</th>
                  <th style="white-space: nowrap">Xếp loại</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(g, i) in currentGrades"
                  :key="i"
                  :class="['scale-row', getRowClass(g.letter)]"
                >
                  <td>
                    {{ i === currentGrades.length - 1 ? `0.0 – ${(currentGrades[i - 1].min - 0.1).toFixed(1)}` : `${g.min.toFixed(1)} – ${i === 0 ? '10.0' : (currentGrades[i - 1].min - 0.1).toFixed(1)}` }}
                  </td>
                  <td>{{ g.s4.toFixed(1) }}</td>
                  <td>
                    <span :class="['letter-badge', getBadgeClass(g.letter)]">{{ g.letter }}</span>
                  </td>
                  <td :class="getRankClass(g.letter)">{{ g.rank }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="scale-note">
            📐 <strong>Công thức tính:</strong><br />
            &nbsp;&nbsp;ĐQT = TP1 × {{ currentWeights.tp1 }} + TP2 × {{ currentWeights.tp2 }}<br />
            &nbsp;&nbsp;Điểm HP = ĐQT × {{ currentWeights.dqt }} + Điểm thi × {{ currentWeights.thi }}<br /><br />
            📊 <strong>Công thức GPA:</strong> A = Σ(điểm_4 × tín_chỉ) / Σtín_chỉ<br />
            &nbsp;&nbsp;Chỉ tính môn đạt điểm chữ A, B, C hoặc D (không tính F)
          </div>
        </div>
      </div>

      <!-- EDIT SCALE MODE -->
      <div v-else class="modal modal-wide" style="max-width: 700px;">
        <div class="modal-hd">
          <span class="modal-title">✏️ Chỉnh sửa Thang điểm & Công thức</span>
          <button class="modal-close" @click="isEditing = false">✕</button>
        </div>
        <div class="modal-body">
          <h3 style="margin-top: 0; color: var(--primary);">1. Chỉnh sửa Công thức tính</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Trọng số TP1</label>
              <input v-model.number="tempWeights.tp1" type="number" step="0.1" />
            </div>
            <div class="form-group">
              <label class="form-label">Trọng số TP2</label>
              <input v-model.number="tempWeights.tp2" type="number" step="0.1" />
            </div>
            <div class="form-group">
              <label class="form-label">Trọng số ĐQT</label>
              <input v-model.number="tempWeights.dqt" type="number" step="0.1" />
            </div>
            <div class="form-group">
              <label class="form-label">Trọng số Điểm Thi</label>
              <input v-model.number="tempWeights.thi" type="number" step="0.1" />
            </div>
          </div>

          <h3 style="color: var(--primary); margin-top: 15px;">2. Chỉnh sửa Thang điểm</h3>
          <p style="font-size: 13px; color: #666; margin-bottom: 10px;">Sắp xếp mốc điểm 10 từ cao xuống thấp. Dòng cuối cùng (F) phải bắt đầu từ 0.</p>
          <div style="max-height: 400px; overflow: auto; border: 1px solid var(--gray-200); border-radius: 8px;">
            <table class="scale-tbl" style="margin-bottom: 0;">
              <thead>
                <tr>
                  <th style="white-space: nowrap">Min (Thang 10)</th>
                  <th style="white-space: nowrap">Thang 4</th>
                  <th style="white-space: nowrap">Điểm chữ</th>
                  <th style="white-space: nowrap">Xếp loại</th>
                  <th style="width: 40px"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(g, i) in tempGrades" :key="i">
                  <td>
                    <input
                      v-model.number="g.min"
                      type="number"
                      class="scale-input"
                      style="width: 70px"
                      step="0.1"
                      :disabled="i === tempGrades.length - 1"
                    />
                  </td>
                  <td>
                    <input v-model.number="g.s4" type="number" class="scale-input" style="width: 70px" step="0.1" />
                  </td>
                  <td>
                    <input v-model="g.letter" type="text" class="scale-input" style="width: 60px" />
                  </td>
                  <td>
                    <input v-model="g.rank" type="text" class="scale-input" />
                  </td>
                  <td style="text-align: center">
                    <button
                      v-if="i < tempGrades.length - 1"
                      class="modal-close"
                      style="font-size: 16px; color: var(--red-500)"
                      @click="removeRow(i)"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-outline btn-sm" style="margin-top: 10px;" @click="addRow">
              ➕ Thêm mốc điểm
            </button>
            <button class="btn btn-outline btn-sm" style="margin-top: 10px; color: var(--red-600); border-color: var(--red-300)" @click="resetDefault">
              Khôi phục Mặc định
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="isEditing = false">Hủy</button>
          <button class="btn btn-primary" @click="save">💾 Lưu cấu hình</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useGrades } from '../../composables/useGrades';
import { useToast } from '../../composables/useToast';

const props = defineProps({
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);
const { currentGrades, currentWeights, setScaleAndWeights, DEFAULT_GRADES, DEFAULT_WEIGHTS } = useGrades();
const { showToast } = useToast();

const isEditing = ref(false);
const tempGrades = ref([]);
const tempWeights = ref({});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    isEditing.value = false;
    tempGrades.value = JSON.parse(JSON.stringify(currentGrades.value));
    tempWeights.value = JSON.parse(JSON.stringify(currentWeights.value));
  }
});

function getRowClass(letter) {
  if (letter.startsWith('B')) return 'scale-row-blue';
  if (letter.startsWith('C')) return 'scale-row-amber';
  if (letter.startsWith('D')) return 'scale-row-orange';
  if (letter === 'F') return 'scale-row-red';
  return 'scale-row-green';
}

function getBadgeClass(letter) {
  if (letter.startsWith('B')) return 'grade-b';
  if (letter.startsWith('C')) return 'grade-c';
  if (letter.startsWith('D')) return 'grade-d';
  if (letter === 'F') return 'grade-f';
  return 'grade-a';
}

function getRankClass(letter) {
  if (letter.startsWith('B')) return 'rank-b';
  if (letter.startsWith('C')) return 'rank-c';
  if (letter.startsWith('D')) return 'rank-d';
  if (letter === 'F') return 'rank-f';
  return 'rank-a';
}

const addRow = () => {
  const newRow = { min: 5.0, s4: 2.0, letter: 'New', rank: 'Mới' };
  tempGrades.value.splice(tempGrades.value.length - 1, 0, newRow);
  tempGrades.value.sort((a, b) => b.min - a.min);
};

const removeRow = (idx) => {
  tempGrades.value.splice(idx, 1);
};

const resetDefault = () => {
  tempGrades.value = JSON.parse(JSON.stringify(DEFAULT_GRADES));
  tempWeights.value = JSON.parse(JSON.stringify(DEFAULT_WEIGHTS));
};

const close = () => {
  isEditing.value = false;
  emit('close');
};

const save = () => {
  tempGrades.value.sort((a, b) => b.min - a.min);
  if (tempGrades.value[tempGrades.value.length - 1].min !== 0) {
    tempGrades.value[tempGrades.value.length - 1].min = 0;
  }

  setScaleAndWeights(tempGrades.value, tempWeights.value);
  showToast('Lưu cấu hình thang điểm thành công!', 'success');
  isEditing.value = false;
};
</script>
