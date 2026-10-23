function toolsModalTemplate() {
  return `<!-- =================== MODAL: CÔNG CỤ =================== -->
    <div
      id="toolsModal"
      class="overlay hidden"
      onclick="overlayClose(event, 'toolsModal')"
    >
      <div class="modal modal-wide tools-modal" role="dialog" aria-labelledby="toolsModalTitle">
        <div class="modal-hd">
          <span class="modal-title" id="toolsModalTitle">🧮 Công cụ học tập</span>
          <button class="modal-close" onclick="closeModal('toolsModal')" aria-label="Đóng">✕</button>
        </div>
        <div class="tabs" role="tablist">
          <button class="tab is-active" role="tab" data-tab="target" onclick="switchToolsTab('target')">🎯 Mục tiêu GPA</button>
          <button class="tab" role="tab" data-tab="whatif" onclick="switchToolsTab('whatif')">🧪 Mô phỏng</button>
          <button class="tab" role="tab" data-tab="grad" onclick="switchToolsTab('grad')">🎓 Tiến độ</button>
          <button class="tab" role="tab" data-tab="history" onclick="switchToolsTab('history')">🕘 Lịch sử</button>
        </div>
        <div class="modal-body">

          <!-- Dự đoán GPA mục tiêu -->
          <div class="tab-panel" id="tab-target">
            <p class="tool-intro">Nhập GPA bạn muốn đạt và số tín chỉ sẽ học tiếp, hệ thống sẽ tính điểm trung bình cần có ở các môn sắp tới.</p>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="t_target">GPA mục tiêu (thang 4)</label>
                <input type="number" id="t_target" min="0" max="4" step="0.01" oninput="calcTarget()" />
              </div>
              <div class="form-group">
                <label class="form-label" for="t_remain">Số tín chỉ còn lại sẽ học</label>
                <input type="number" id="t_remain" min="1" step="1" oninput="calcTarget()" />
              </div>
            </div>
            <div class="chips">
              <button class="chip" onclick="setTargetGpa(2.0)">2.0 · Trung bình</button>
              <button class="chip" onclick="setTargetGpa(2.5)">2.5 · Khá</button>
              <button class="chip" onclick="setTargetGpa(3.2)">3.2 · Giỏi</button>
              <button class="chip" onclick="setTargetGpa(3.6)">3.6 · Xuất sắc</button>
            </div>
            <div id="targetResult" class="tool-result"></div>
          </div>

          <!-- Mô phỏng "nếu tôi được điểm X" -->
          <div class="tab-panel hidden" id="tab-whatif">
            <p class="tool-intro">Thử một mức điểm thi giả định cho môn chưa thi, hoặc môn muốn cải thiện, và xem GPA thay đổi ngay. Dữ liệu thật không bị thay đổi.</p>
            <div class="form-grid">
              <div class="form-group full">
                <label class="form-label" for="w_subject">Chọn môn học</label>
                <select id="w_subject" onchange="onWhatIfSubjectChange()"></select>
              </div>
              <div class="form-group">
                <label class="form-label" for="w_score">Điểm thi giả định (0–10)</label>
                <input type="number" id="w_score" min="0" max="10" step="0.1" oninput="calcWhatIf()" />
              </div>
              <div class="form-group">
                <span class="form-label">Điểm hiện tại</span>
                <div id="w_current" class="static-field">—</div>
              </div>
            </div>
            <div id="whatIfResult" class="tool-result"></div>
          </div>

          <!-- Tiến độ tốt nghiệp & cảnh báo -->
          <div class="tab-panel hidden" id="tab-grad">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="g_total">Tổng tín chỉ của chương trình</label>
                <input type="number" id="g_total" min="1" step="1" oninput="calcGraduation()" />
              </div>
            </div>
            <div id="gradResult" class="tool-result"></div>
            <div id="gradAlerts"></div>
            <p class="tool-note">Các mốc cảnh báo chỉ mang tính tham khảo theo quy chế phổ biến, mỗi trường có thể quy định khác nhau.</p>
          </div>

          <!-- Lịch sử thay đổi -->
          <div class="tab-panel hidden" id="tab-history">
            <div class="history-actions">
              <button class="btn btn-outline btn-sm" onclick="undo()">↩️ Hoàn tác</button>
              <button class="btn btn-outline btn-sm" onclick="redo()">↪️ Làm lại</button>
              <span class="muted-label" id="historyCount"></span>
            </div>
            <ul id="historyList" class="history-list"></ul>
            <p class="tool-note">Lịch sử chỉ lưu trong phiên làm việc hiện tại (tối đa 40 thao tác gần nhất). Phím tắt: Ctrl+Z hoàn tác, Ctrl+Y làm lại.</p>
          </div>

        </div>
      </div>
    </div>`;
}
