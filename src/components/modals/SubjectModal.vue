<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="overlay" @click.self="close">
      <div class="modal">
        <div class="modal-hd">
          <span class="modal-title">{{ isEdit ? 'Chỉnh sửa môn học' : 'Thêm môn học' }}</span>
          <button class="modal-close" @click="close">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group full">
              <label class="form-label">Tên môn học <span class="required">*</span></label>
              <input
                v-model="form.tenMon"
                type="text"
                placeholder="Nhập tên môn học..."
              />
            </div>
            <div class="form-group">
              <label class="form-label">Số tín chỉ <span class="required">*</span></label>
              <input
                v-model.number="form.tinChi"
                type="number"
                placeholder="3"
                min="1"
                max="10"
              />
            </div>
            <div class="form-group"></div>
            <div class="form-group">
              <label class="form-label" title="Điểm giữa kỳ / kiểm tra thường xuyên">
                TP1 – Giữa kỳ (0–10)
              </label>
              <input
                v-model="form.tp1"
                type="number"
                placeholder="0–10"
                min="0"
                max="10"
                step="0.1"
              />
            </div>
            <div class="form-group">
              <label class="form-label" title="Điểm chuyên cần / thái độ học tập">
                TP2 – Chuyên cần (0–10)
              </label>
              <input
                v-model="form.tp2"
                type="number"
                placeholder="0–10"
                min="0"
                max="10"
                step="0.1"
              />
            </div>
            <div class="form-group full">
              <label class="form-label">
                Điểm thi cuối kỳ (0–10) <span class="muted-label">— để trống nếu chưa thi</span>
              </label>
              <input
                v-model="form.diemThi"
                type="number"
                placeholder="0–10"
                min="0"
                max="10"
                step="0.1"
              />
            </div>
          </div>

          <!-- Live Preview Calculation -->
          <div class="calc-box">
            <div class="calc-item">
              <div class="calc-item-label">ĐQT</div>
              <div class="calc-item-value">{{ preview.dqt }}</div>
            </div>
            <div class="calc-item">
              <div class="calc-item-label">Điểm HP</div>
              <div class="calc-item-value">{{ preview.diemHP }}</div>
            </div>
            <div class="calc-item">
              <div class="calc-item-label">Điểm chữ</div>
              <div class="calc-item-value">{{ preview.diemChu }}</div>
            </div>
            <div class="calc-item">
              <div class="calc-item-label">Thang 4</div>
              <div class="calc-item-value">{{ preview.s4 }}</div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" @click="close">Hủy</button>
          <button class="btn btn-primary" @click="save">💾 Lưu</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useGrades, parseScore } from '../../composables/useGrades';
import { useToast } from '../../composables/useToast';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  subjectData: { type: Object, default: null }
});

const emit = defineEmits(['close', 'save']);
const { currentGrades, currentWeights } = useGrades();
const { showToast } = useToast();

const form = ref({
  tenMon: '',
  tinChi: 3,
  tp1: '',
  tp2: '',
  diemThi: ''
});

const isEdit = computed(() => !!props.subjectData?.id);

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.subjectData) {
      form.value = {
        tenMon: props.subjectData.tenMon || '',
        tinChi: props.subjectData.tinChi || 3,
        tp1: props.subjectData.tp1 !== null && props.subjectData.tp1 !== undefined ? props.subjectData.tp1 : '',
        tp2: props.subjectData.tp2 !== null && props.subjectData.tp2 !== undefined ? props.subjectData.tp2 : '',
        diemThi: props.subjectData.diemThi !== null && props.subjectData.diemThi !== undefined ? props.subjectData.diemThi : ''
      };
    } else {
      form.value = { tenMon: '', tinChi: 3, tp1: '', tp2: '', diemThi: '' };
    }
  }
});

const preview = computed(() => {
  const tp1 = parseScore(form.value.tp1) ?? 0;
  const tp2 = parseScore(form.value.tp2) ?? 0;
  const thi = parseScore(form.value.diemThi);
  const dqt = +(tp1 * currentWeights.value.tp1 + tp2 * currentWeights.value.tp2).toFixed(2);

  if (thi === null) {
    return { dqt: dqt.toFixed(1), diemHP: '—', diemChu: '—', s4: '—' };
  }

  const hp = +(dqt * currentWeights.value.dqt + thi * currentWeights.value.thi).toFixed(2);
  let g = currentGrades.value[currentGrades.value.length - 1];
  for (const gradeObj of currentGrades.value) {
    if (hp >= gradeObj.min) {
      g = gradeObj;
      break;
    }
  }

  return {
    dqt: dqt.toFixed(1),
    diemHP: hp.toFixed(1),
    diemChu: g.letter,
    s4: g.s4
  };
});

const close = () => emit('close');

const save = () => {
  if (!form.value.tenMon.trim()) {
    showToast("Vui lòng nhập tên môn học!", "warning");
    return;
  }
  if (!form.value.tinChi || form.value.tinChi < 1) {
    showToast("Số tín chỉ phải lớn hơn 0!", "warning");
    return;
  }

  emit('save', {
    ...form.value,
    id: props.subjectData?.id
  });
  close();
};
</script>
