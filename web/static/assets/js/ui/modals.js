// =================== MODAL HELPERS ===================
function openScaleModal() {
  document.getElementById("scaleModal").classList.remove("hidden");
}
function openExcelModal() {
  document.getElementById("excelModal").classList.remove("hidden");
}
function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}
function overlayClose(e, id) {
  if (e.target === e.currentTarget) closeModal(id);
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    [
      "addModal",
      "pasteModal",
      "scaleModal",
      "excelModal",
      "editScaleModal",
      "toolsModal",
      "loginModal",
      "confirmModal",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el && !el.classList.contains("hidden")) closeModal(id);
    });
  }
  if (
    e.key === "Enter" &&
    !document.getElementById("addModal").classList.contains("hidden") &&
    document.activeElement?.tagName !== "TEXTAREA"
  ) {
    saveSubject();
  }
});
