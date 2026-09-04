<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="overlay" @click.self="cancel">
      <div class="modal" style="max-width: 400px;">
        <div class="modal-hd">
          <span class="modal-title">⚠️ Xác nhận</span>
          <button class="modal-close" @click="cancel">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 14px; color: var(--gray-700); line-height: 1.5; white-space: pre-line;">
            {{ message }}
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="cancel">Hủy</button>
          <button class="btn btn-danger" @click="confirm">Đồng ý</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  message: { type: String, default: 'Bạn có chắc chắn muốn thực hiện thao tác này?' }
});

const emit = defineEmits(['confirm', 'cancel']);

const cancel = () => emit('cancel');
const confirm = () => emit('confirm');
</script>
