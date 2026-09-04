<template>
  <div class="header">
    <div class="header-left">
      <h1>📊 Bảng Điểm Học Tập</h1>
      <p>
        Quản lý điểm & tính GPA theo thang điểm 4 | Tự động tính ĐQT · Điểm HP · Điểm chữ
      </p>
    </div>
    <div class="header-right">
      <!-- User Profile (Logged In) -->
      <div
        v-if="user"
        class="user-profile-badge"
        style="display: flex; align-items: center; gap: 8px; margin-right: 12px; background: white; padding: 4px 12px 4px 4px; border-radius: 20px; border: 1px solid var(--gray-200);"
      >
        <img
          :src="user.photoURL || 'https://ui-avatars.com/api/?name=' + (user.email || 'U')"
          style="width: 28px; height: 28px; border-radius: 50%;"
        />
        <span style="font-size: 13px; font-weight: 500; color: var(--gray-700);">
          {{ user.displayName || (user.email ? user.email.split('@')[0] : 'User') }}
        </span>
        <button
          @click="$emit('logout')"
          style="background: none; border: none; color: var(--red); font-weight: 600; font-size: 13px; cursor: pointer; padding: 0 8px; border-left: 1px solid var(--gray-200); margin-left: 4px;"
        >
          Thoát
        </button>
      </div>

      <!-- Login button if not logged in -->
      <button
        v-else
        class="btn btn-outline btn-header"
        style="margin-right: 12px;"
        @click="$emit('openLogin')"
      >
        ☁️ Đăng nhập
      </button>

      <!-- Sync Status Badge -->
      <div
        v-if="user"
        id="syncBtnHeader"
        class="btn btn-outline btn-header"
        style="margin-right: 12px; background-color: var(--blue-bg); color: var(--blue); border-color: var(--blue); cursor: default; pointer-events: none;"
      >
        ☁️ Đã đồng bộ
      </div>

      <!-- Scale Settings Modal Trigger -->
      <button
        id="btnOpenScaleModal"
        class="btn btn-outline btn-header"
        @click="$emit('openScale')"
      >
        📋 Thang điểm
      </button>

      <!-- Export Excel Trigger -->
      <button
        class="btn btn-outline btn-header"
        @click="$emit('exportExcel')"
      >
        ⬇ Xuất Excel
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  user: { type: Object, default: null }
});

defineEmits(['openLogin', 'logout', 'openScale', 'exportExcel']);
</script>
