<template>
  <div>
    <!-- ===== STATS BAR ===== -->
    <div id="statsBar" class="stats-bar">
      <!-- Card 1: GPA Thang 4 -->
      <div class="stat-card stat-gpa">
        <div class="stat-icon">🎓</div>
        <div class="stat-content">
          <div class="stat-label">GPA (Thang 4)</div>
          <div class="stat-value">{{ stats.gpa4 }}</div>
          <div class="stat-sub">Thang điểm hệ 4</div>
        </div>
      </div>

      <!-- Card 2: GPA Thang 10 -->
      <div class="stat-card stat-gpa10">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <div class="stat-label">GPA (Thang 10)</div>
          <div class="stat-value">{{ stats.gpa10 }}</div>
          <div class="stat-sub">Thang điểm hệ 10</div>
        </div>
      </div>

      <!-- Card 3: Xếp loại -->
      <div class="stat-card stat-rank">
        <div class="stat-icon">🏆</div>
        <div class="stat-content">
          <div class="stat-label">Xếp loại học lực</div>
          <div class="stat-value">{{ stats.rank }}</div>
          <div class="stat-sub">Xếp loại tích lũy</div>
        </div>
      </div>

      <!-- Card 4: Tổng tín chỉ -->
      <div class="stat-card stat-credits">
        <div class="stat-icon">📚</div>
        <div class="stat-content">
          <div class="stat-label">Tổng số tín chỉ</div>
          <div class="stat-value">{{ stats.totalTc }}</div>
          <div class="stat-sub">Tích lũy: {{ stats.passTc }} TC | Nợ: {{ stats.failTc }} TC</div>
        </div>
      </div>
    </div>

    <!-- ===== TOOLBAR ===== -->
    <div class="toolbar">
      <div class="toolbar-filters" style="display: flex; gap: 12px; align-items: center;">
        <span class="count-label" style="white-space: nowrap;">
          Tổng: {{ stats.count }} môn
        </span>

        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Tìm môn học..."
          style="padding: 6px 12px; border: 1px solid var(--gray-300); border-radius: 6px; font-size: 13px; outline: none; flex: 1; min-width: 180px; max-width: 240px;"
        />

        <select
          v-model="sortMode"
          style="padding: 6px 12px; border: 1px solid var(--gray-300); border-radius: 6px; font-size: 13px; outline: none; background: white; cursor: pointer; max-width: 180px; text-overflow: ellipsis;"
        >
          <option value="default">Sắp xếp: Mặc định</option>
          <option value="name_asc">Tên: A - Z</option>
          <option value="name_desc">Tên: Z - A</option>
          <option value="tc_desc">Tín chỉ: Giảm dần</option>
          <option value="hp_desc">Điểm HP: Giảm dần</option>
          <option value="hp_asc">Điểm HP: Tăng dần</option>
        </select>
      </div>

      <div class="toolbar-actions">
        <button id="btnPasteData" class="btn btn-outline btn-sm" @click="$emit('openPaste')">
          📋 Dán dữ liệu
        </button>
        <button id="btnImportExcel" class="btn btn-outline btn-sm" @click="$emit('openExcel')">
          📂 Nhập Excel
        </button>
        <button class="btn btn-danger btn-sm" @click="$emit('deleteAll')">
          🗑️ Xóa tất cả
        </button>
        <button id="btnAddSubject" class="btn btn-primary btn-sm" @click="$emit('addSubject')">
          ＋ Thêm môn
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGrades } from '../composables/useGrades';

defineEmits(['openPaste', 'openExcel', 'deleteAll', 'addSubject']);

const { stats, searchQuery, sortMode } = useGrades();
</script>
