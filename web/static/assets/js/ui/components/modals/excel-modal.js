function excelModalTemplate() {
  return `<!-- =================== MODAL: EXCEL =================== -->
    <div
      id="excelModal"
      class="overlay hidden"
      onclick="overlayClose(event, 'excelModal')"
    >
      <div class="modal">
        <div class="modal-hd">
          <span class="modal-title">📂 Nhập dữ liệu từ Excel</span>
          <button class="modal-close" onclick="closeModal('excelModal')">
            ✕
          </button>
        </div>
        <div class="modal-body">
          <div class="hint-box" style="margin-bottom: 20px;">
            <strong>Cấu trúc file Excel để hệ thống nhận diện chính xác:</strong><br />
            File cần có ít nhất các cột sau (không phân biệt chữ hoa/thường):<br />
            - <code>Tên môn</code><br />
            - <code>Kỳ</code> (hoặc Học kỳ)<br />
            - <code>Tín</code> (hoặc Tín chỉ)<br />
            - <code>TP1</code> (hoặc Giữa kỳ)<br />
            - <code>TP2</code> (hoặc Chuyên cần)<br />
            - <code>Thi</code> (hoặc Điểm thi)<br />
            - <code>Năm học</code> (Tùy chọn)<br /><br />
            Tải <a href="/assets/mau_bang_diem.xlsx" download style="color: var(--primary); font-weight: bold; text-decoration: underline;">File Excel mẫu</a> tại đây.
          </div>
          
          <div style="text-align: center; border: 2px dashed #ccc; padding: 30px; border-radius: 8px; background: #f9fafb;">
            <p style="margin-bottom: 15px; color: #555;">Kéo thả file hoặc nhấn nút bên dưới để chọn file (.xlsx, .xls, .csv)</p>
            <button class="btn btn-primary" onclick="document.getElementById('excelInput').click()">
              📁 Chọn file từ máy tính
            </button>
            <input
              class="visually-hidden"
              type="file"
              id="excelInput"
              accept=".xlsx,.xls,.csv"
              onchange="handleExcelAndClose(this)"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('excelModal')">
            Hủy
          </button>
        </div>
      </div>
    </div>`;
}

function handleExcelAndClose(input) {
  handleExcel(input);
  closeModal('excelModal');
}
