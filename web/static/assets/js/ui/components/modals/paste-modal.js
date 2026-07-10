function pasteModalTemplate() {
  return `<!-- =================== MODAL: PASTE =================== -->
    <div
      id="pasteModal"
      class="overlay hidden"
      onclick="overlayClose(event, 'pasteModal')"
    >
      <div class="modal modal-wide">
        <div class="modal-hd">
          <span class="modal-title">📋 Nhập dữ liệu từ văn bản</span>
          <button class="modal-close" onclick="closeModal('pasteModal')">
            ✕
          </button>
        </div>
        <div class="modal-body">
          <div class="hint-box">
            <strong>Định dạng 1 – Từ cổng thông tin sinh viên</strong> (sao chép
            bảng điểm, tab-separated):<br />
            Cột: <code>STT</code> <code>Loại</code> <code>Năm học</code>
            <code>HK</code> <code>Môn thi</code> <code>Lần</code>
            <code>TP1</code> <code>TP2</code> <code>ĐQT</code>
            <code>Điểm thi</code> <code>Điểm HP</code> <code>Điểm chữ</code
            ><br /><br />
            <strong>Định dạng 2 – Đơn giản</strong> (tab hoặc dấu phẩy):<br />
            Cột: <code>Tên môn</code> <code>HK</code> <code>TínChỉ</code>
            <code>TP1</code> <code>TP2</code>
            <code>ĐiểmThi</code> [<code>NămHọc</code>]<br /><br />
            <strong>Lưu ý:</strong> Hệ thống sẽ tự tính lại ĐQT và Điểm HP từ
            TP1, TP2, Điểm thi theo công thức đã cho.
          </div>
          <textarea
            id="pasteInput"
            placeholder="Dán dữ liệu vào đây... (Ctrl+V)"
            oninput="parsePasteInput()"
          ></textarea>
          <div id="pastePreviewWrap" class="hidden">
            <div class="preview-heading">
              <span class="preview-title"
                >Xem trước:
                <span id="previewCount" class="primary-text">0</span>
                môn học</span
              >
              <span
                id="warnCredits"
                class="warn-text hidden"
                >⚠️ Hàng vàng: tín chỉ mặc định = 3, hãy chỉnh sửa sau</span
              >
            </div>
            <div class="preview-wrap">
              <table>
                <thead>
                  <tr>
                    <th class="subject-preview-col">Môn học</th>
                    <th>Tín chỉ</th>
                    <th>TP1</th>
                    <th>TP2</th>
                    <th>ĐQT</th>
                    <th>Điểm thi</th>
                    <th>Điểm HP</th>
                    <th>Điểm chữ</th>
                  </tr>
                </thead>
                <tbody id="pastePreviewBody"></tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('pasteModal')">
            Hủy
          </button>
          <button
            class="btn btn-primary"
            id="btnConfirmPaste"
            disabled
            onclick="confirmPaste()"
          >
            ✅ Nhập dữ liệu
          </button>
        </div>
      </div>
    </div>`;
}
