function dashboardShellTemplate() {
  return `<!-- ===== STATS BAR ===== -->
    <div class="stats-bar" id="statsBar"></div>

    <!-- ===== ALERT BAR (CẢNH BÁO TIẾN ĐỘ / HỌC VỤ) ===== -->
    <div id="alertBar" class="alert-bar hidden"></div>

    <!-- ===== INSIGHTS PANEL (BIỂU ĐỒ & PHÂN TÍCH) ===== -->
    <div id="insightsPanel" class="insights-panel hidden"></div>

    <!-- ===== TOOLBAR ===== -->
    <div class="toolbar">
      <div class="toolbar-filters">
        <span id="countLabel" class="count-label"></span>
        
        <input 
          type="text" 
          id="searchInput" 
          placeholder="🔍 Tìm môn học..." 
          oninput="setFilterSearch(this.value); renderAll();"
        >
        
        <select 
          id="sortSelect" 
          onchange="setFilterSort(this.value); renderAll();"
        >
          <option value="default">Sắp xếp: Mặc định</option>
          <option value="name_asc">Tên: A - Z</option>
          <option value="name_desc">Tên: Z - A</option>
          <option value="tc_desc">Tín chỉ: Giảm dần</option>
          <option value="hp_desc">Điểm HP: Giảm dần</option>
          <option value="hp_asc">Điểm HP: Tăng dần</option>
        </select>

        <button
          id="btnGroupSemester"
          class="btn btn-outline btn-sm"
          onclick="toggleGroupBySemester()"
          title="Gom nhóm bảng điểm theo từng học kỳ kèm GPA và tiến độ tích lũy"
        >
          📑 Gom theo kỳ
        </button>

        <button
          id="btnInsights"
          class="btn btn-outline btn-sm"
          onclick="toggleInsights()"
          title="Bật / tắt bảng phân tích biểu đồ GPA và phân bố điểm chữ"
        >
          📈 Biểu đồ
        </button>
      </div>

      <div class="toolbar-actions">
        <div class="history-actions" style="display:inline-flex; gap:4px; margin-right:4px;">
          <button id="btnUndo" class="btn btn-outline btn-sm" onclick="undo()" disabled title="Hoàn tác thao tác vừa làm (Ctrl+Z)">
            ↩️
          </button>
          <button id="btnRedo" class="btn btn-outline btn-sm" onclick="redo()" disabled title="Làm lại thao tác vừa hoàn tác (Ctrl+Y)">
            ↪️
          </button>
        </div>

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

