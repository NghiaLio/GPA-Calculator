import { ref } from 'vue';

const toasts = ref([]);
let toastId = 0;

export function useToast() {
  const showToast = (message, type = 'success') => {
    const id = ++toastId;
    let icon = '💡';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    const toast = { id, message, type, icon, show: false };
    toasts.value.push(toast);

    setTimeout(() => {
      toast.show = true;
    }, 10);

    setTimeout(() => {
      toast.show = false;
      setTimeout(() => {
        const idx = toasts.value.findIndex(t => t.id === id);
        if (idx !== -1) toasts.value.splice(idx, 1);
      }, 300);
    }, 3000);
  };

  const removeToast = (id) => {
    const idx = toasts.value.findIndex(t => t.id === id);
    if (idx !== -1) toasts.value.splice(idx, 1);
  };

  return {
    toasts,
    showToast,
    removeToast
  };
}
