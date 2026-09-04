<template>
  <div class="app-container">
    <!-- Header -->
    <Header
      :user="user"
      @open-login="isLoginModalOpen = true"
      @logout="handleLogout"
      @open-scale="isScaleModalOpen = true"
      @export-excel="exportToExcel"
    />

    <!-- Main Dashboard -->
    <DashboardShell
      @open-paste="isPasteModalOpen = true"
      @open-excel="isExcelModalOpen = true"
      @delete-all="askDeleteAll"
      @add-subject="openAddModal(null)"
    />

    <!-- Subject Table -->
    <SubjectTable
      :subjects="filteredSubjects"
      @edit="openAddModal"
      @delete="askDeleteSubject"
    />

    <!-- Toast Notifications -->
    <Toast />

    <!-- Guided Onboarding Tour & Help Button -->
    <TourGuide />

    <!-- Modals -->
    <SubjectModal
      :is-open="isAddModalOpen"
      :subject-data="editingSubject"
      @close="isAddModalOpen = false"
      @save="handleSaveSubject"
    />

    <PasteModal
      :is-open="isPasteModalOpen"
      @close="isPasteModalOpen = false"
      @import="handleImportSubjects"
    />

    <ExcelModal
      :is-open="isExcelModalOpen"
      @close="isExcelModalOpen = false"
      @import="handleImportSubjects"
    />

    <ScaleModal
      :is-open="isScaleModalOpen"
      @close="isScaleModalOpen = false"
    />

    <LoginModal
      :is-open="isLoginModalOpen"
      @close="isLoginModalOpen = false"
      @login="handleLogin"
    />

    <ConfirmModal
      :is-open="isConfirmModalOpen"
      :message="confirmMessage"
      @close="isConfirmModalOpen = false"
      @cancel="isConfirmModalOpen = false"
      @confirm="executeConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as XLSX from 'xlsx';
import Header from './components/Header.vue';
import DashboardShell from './components/DashboardShell.vue';
import SubjectTable from './components/SubjectTable.vue';
import Toast from './components/Toast.vue';
import TourGuide from './components/TourGuide.vue';
import SubjectModal from './components/modals/SubjectModal.vue';
import PasteModal from './components/modals/PasteModal.vue';
import ExcelModal from './components/modals/ExcelModal.vue';
import ScaleModal from './components/modals/ScaleModal.vue';
import LoginModal from './components/modals/LoginModal.vue';
import ConfirmModal from './components/modals/ConfirmModal.vue';

import { useGrades } from './composables/useGrades';
import { useAuth } from './composables/useAuth';
import { useToast } from './composables/useToast';

const {
  subjects,
  filteredSubjects,
  stats,
  loadLocalState,
  addSubject,
  updateSubject,
  deleteSubject,
  clearAllSubjects,
  syncToCloud,
  subscribeCloudData,
  unsubscribeCloudData
} = useGrades();

const { user, initAuth, loginWithGoogle, logout } = useAuth();
const { showToast } = useToast();

// Modal States
const isAddModalOpen = ref(false);
const editingSubject = ref(null);
const isPasteModalOpen = ref(false);
const isExcelModalOpen = ref(false);
const isScaleModalOpen = ref(false);
const isLoginModalOpen = ref(false);

const isConfirmModalOpen = ref(false);
const confirmMessage = ref('');
let confirmCallback = null;

onMounted(() => {
  loadLocalState();
  initAuth((currentUser) => {
    if (currentUser) {
      subscribeCloudData(currentUser, () => {
        showToast(`☁️ Đã đồng bộ dữ liệu từ Cloud Firestore cho ${currentUser.displayName || currentUser.email}`, 'success');
      });
    }
  });
});

// Watch subjects changes to auto-sync to Cloud Firestore if logged in
watch(subjects, () => {
  if (user.value) {
    syncToCloud(user.value);
  }
}, { deep: true });

// Handlers
const openAddModal = (subj) => {
  editingSubject.value = subj ? { ...subj } : null;
  isAddModalOpen.value = true;
};

const handleSaveSubject = (subjData) => {
  if (subjData.id) {
    updateSubject(subjData.id, subjData);
    showToast(`Đã cập nhật môn "${subjData.tenMon}"!`, 'success');
  } else {
    addSubject(subjData);
    showToast(`Đã thêm môn "${subjData.tenMon}"!`, 'success');
  }
};

const handleImportSubjects = (importedList) => {
  for (const s of importedList) {
    addSubject(s);
  }
};

const askDeleteSubject = (id) => {
  const subj = subjects.value.find(s => s.id === id);
  confirmMessage.value = `Bạn có chắc chắn muốn xóa môn "${subj ? subj.tenMon : ''}"?`;
  confirmCallback = () => {
    deleteSubject(id);
    showToast('Đã xóa môn học!', 'info');
  };
  isConfirmModalOpen.value = true;
};

const askDeleteAll = () => {
  if (!subjects.value.length) {
    showToast('Chưa có môn học nào để xóa!', 'warning');
    return;
  }
  confirmMessage.value = '⚠️ Bạn có chắc chắn muốn XÓA TẤT CẢ môn học trong danh sách?';
  confirmCallback = () => {
    clearAllSubjects();
    showToast('Đã xóa toàn bộ môn học!', 'info');
  };
  isConfirmModalOpen.value = true;
};

const executeConfirm = () => {
  if (confirmCallback) confirmCallback();
  isConfirmModalOpen.value = false;
};

const handleLogin = async () => {
  try {
    const loggedInUser = await loginWithGoogle();
    showToast(`Đăng nhập thành công: ${loggedInUser.displayName || loggedInUser.email}`, 'success');
    subscribeCloudData(loggedInUser);
  } catch (err) {
    showToast('Đăng nhập thất bại: ' + err.message, 'error');
  }
};

const handleLogout = async () => {
  unsubscribeCloudData();
  await logout();
  showToast('Đã đăng xuất tài khoản Google', 'info');
};

const exportToExcel = () => {
  if (!subjects.value.length) {
    showToast('Chưa có dữ liệu để xuất!', 'warning');
    return;
  }
  const data = [
    [
      'Năm học', 'Học kỳ', 'Môn học', 'Tín chỉ', 'TP1', 'TP2', 'ĐQT', 'Điểm thi', 'Điểm HP', 'Điểm chữ', 'Thang 4', 'Xếp loại'
    ]
  ];

  for (const s of filteredSubjects.value) {
    data.push([
      s.namHoc || '',
      s.hocKy || '1',
      s.tenMon,
      s.tinChi,
      s.tp1,
      s.tp2,
      s.dqt,
      s.diemThi ?? '',
      s.diemHP ?? '',
      s.diemChu ?? '',
      s.s4 ?? '',
      s.rank ?? ''
    ]);
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [10, 10, 30, 8, 8, 8, 8, 10, 10, 10, 8, 16].map(w => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws, 'Bảng điểm');

  // Summary sheet
  const sum = [
    ['GPA tích lũy (thang 4)', stats.value.gpa4],
    ['GPA tích lũy (thang 10)', stats.value.gpa10],
    ['Xếp loại học lực', stats.value.rank],
    ['Tổng số tín chỉ', stats.value.totalTc],
    ['Tín chỉ đạt (qua môn)', stats.value.passTc],
    ['Tín chỉ không đạt (F)', stats.value.failTc],
    ['Tổng số môn học', stats.value.count]
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(sum);
  ws2['!cols'] = [{ wch: 28 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Tổng hợp GPA');

  XLSX.writeFile(wb, `bang_diem_${new Date().toISOString().slice(0, 10)}.xlsx`);
  showToast('Đã xuất file Excel thành công!', 'success');
};
</script>
