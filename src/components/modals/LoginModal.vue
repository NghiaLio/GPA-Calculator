<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="overlay" @click.self="close">
      <div class="modal" style="max-width: 400px; text-align: center;">
        <div class="modal-hd" style="justify-content: center; position: relative;">
          <span class="modal-title">☁️ Đăng nhập Đám mây</span>
          <button class="modal-close" style="position: absolute; right: 16px;" @click="close">✕</button>
        </div>
        <div class="modal-body" style="padding: 24px 16px;">
          <div style="font-size: 48px; margin-bottom: 12px;">🎓</div>
          <h3 style="margin: 0 0 8px 0; color: var(--gray-800);">Đồng bộ bảng điểm của bạn</h3>
          <p style="font-size: 13px; color: var(--gray-600); margin-bottom: 24px; line-height: 1.5;">
            Đăng nhập bằng tài khoản Google để lưu trữ tự động trên Cloud Firestore và truy cập bảng điểm trên mọi thiết bị.
          </p>
          <button
            class="btn btn-primary"
            style="width: 100%; padding: 12px; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px;"
            @click="login"
          >
            <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24">
              <path fill="#ffffff" d="M12.24 10.285V13.4h6.887c-.282 1.487-1.745 4.364-6.887 4.364-4.14 0-7.514-3.375-7.514-7.514s3.374-7.514 7.514-7.514c2.355 0 3.931.996 4.832 1.864l2.463-2.378C17.962 1.077 15.342 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c7.065 0 11.758-4.966 11.758-11.96 0-.802-.083-1.416-.188-2.235H12.24z"/>
            </svg>
            Đăng nhập với Google
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'login']);

const close = () => emit('close');
const login = () => {
  emit('login');
  close();
};
</script>
