function subjectModalTemplate() {
  return `<!-- =================== MODAL: ADD/EDIT =================== -->
    <div
      id="addModal"
      class="overlay hidden"
      onclick="overlayClose(event, 'addModal')"
    >
      <div class="modal">
        <div class="modal-hd">
          <span class="modal-title" id="addModalTitle">Thêm môn học</span>
          <button class="modal-close" onclick="closeModal('addModal')">
            ✕
          </button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group full">
              <label class="form-label"
                >Tên môn học <span class="required">*</span></label
              >
              <input
                type="text"
                id="f_tenMon"
                placeholder="Nhập tên môn học..."
              />
            </div>
            <div class="form-group">
              <label class="form-label"
                >Số tín chỉ <span class="required">*</span></label
              >
              <input
                type="number"
                id="f_tinChi"
                placeholder="3"
                min="1"
                max="10"
                value="3"
                oninput="updatePreview()"
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="f_hocKy">Học kỳ</label>
              <select id="f_hocKy">
                <option value="">— Chưa xác định —</option>
                <option value="1">Học kỳ 1</option>
                <option value="2">Học kỳ 2</option>
                <option value="Hè">Học kỳ hè</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="f_namHoc">Năm học</label>
              <input
                type="text"
                id="f_namHoc"
                list="namHocList"
                placeholder="VD: 2024-2025"
                maxlength="9"
                autocomplete="off"
              />
              <datalist id="namHocList"></datalist>
            </div>
            <div class="form-group full">
              <label class="check-line" for="f_hocLai" title="Nếu trùng tên với môn khác, chỉ lần có điểm cao nhất được tính vào GPA">
                <input type="checkbox" id="f_hocLai" />
                <span>🔁 Môn học lại / cải thiện điểm</span>
                <span class="muted-label">— chỉ tính lần điểm cao nhất</span>
              </label>
            </div>
            <div class="form-group">
              <label
                class="form-label"
                title="Điểm giữa kỳ / kiểm tra thường xuyên"
                >TP1 – Giữa kỳ (0–10)</label
              >
              <input
                type="number"
                id="f_tp1"
                placeholder="0–10"
                min="0"
                max="10"
                step="0.1"
                oninput="updatePreview()"
              />
            </div>
            <div class="form-group">
              <label
                class="form-label"
                title="Điểm chuyên cần / thái độ học tập"
                >TP2 – Chuyên cần (0–10)</label
              >
              <input
                type="number"
                id="f_tp2"
                placeholder="0–10"
                min="0"
                max="10"
                step="0.1"
                oninput="updatePreview()"
              />
            </div>
            <div class="form-group full">
              <label class="form-label"
                >Điểm thi cuối kỳ (0–10)
                <span class="muted-label"
                  >— để trống nếu chưa thi</span
                ></label
              >
              <input
                type="number"
                id="f_diemThi"
                placeholder="0–10"
                min="0"
                max="10"
                step="0.1"
                oninput="updatePreview()"
              />
            </div>
          </div>
          <div class="calc-box" id="calcPreview">
            <div class="calc-item">
              <div class="calc-item-label">ĐQT</div>
              <div class="calc-item-value muted-value" id="pv_dqt">
                —
              </div>
            </div>
            <div class="calc-item">
              <div class="calc-item-label">Điểm HP</div>
              <div class="calc-item-value muted-value" id="pv_hp">
                —
              </div>
            </div>
            <div class="calc-item">
              <div class="calc-item-label">Điểm chữ</div>
              <div class="calc-item-value muted-value" id="pv_letter">
                —
              </div>
            </div>
            <div class="calc-item">
              <div class="calc-item-label">Thang 4</div>
              <div class="calc-item-value muted-value" id="pv_s4">
                —
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('addModal')">
            Hủy
          </button>
          <button class="btn btn-primary" onclick="saveSubject()">
            💾 Lưu
          </button>
        </div>
      </div>
    </div>`;
}
