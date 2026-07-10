function dashboardShellTemplate() {
  return `<!-- ===== STATS BAR ===== -->
    <div class="stats-bar" id="statsBar"></div>

    <!-- ===== TOOLBAR ===== -->
    <div class="toolbar">
      <div class="toolbar-filters" style="display: flex; gap: 12px; align-items: center;">
        <span id="countLabel" class="count-label" style="white-space: nowrap;"></span>
        
        <input 
          type="text" 
          id="searchInput" 
          placeholder="🔍 Tìm môn học..." 
          style="padding: 6px 12px; border: 1px solid var(--gray-300); border-radius: 6px; font-size: 13px; outline: none; flex: 1; min-width: 180px; max-width: 240px;"
          oninput="setFilterSearch(this.value); renderAll();"
        >
        
        <select 
          id="sortSelect" 
          style="padding: 6px 12px; border: 1px solid var(--gray-300); border-radius: 6px; font-size: 13px; outline: none; background: white; cursor: pointer; max-width: 180px; text-overflow: ellipsis;"
          onchange="setFilterSort(this.value); renderAll();"
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
        <button id="btnPasteData" class="btn btn-outline btn-sm" onclick="openPasteModal()">
          📋 Dán dữ liệu
        </button>
        <button id="btnImportExcel" class="btn btn-outline btn-sm" onclick="openExcelModal()">
          📂 Nhập Excel
        </button>
        <button id="btnDeleteAll" class="btn btn-danger btn-sm" onclick="deleteAllSubjects()">
          🗑️ Xóa tất cả
        </button>
        <button id="btnAddSubject" class="btn btn-primary btn-sm" onclick="openAddModal(null)">
          ＋ Thêm môn
        </button>
      </div>
    </div>

    <!-- ===== MAIN ===== -->
    <div class="main" id="mainContent"></div>`;
}
