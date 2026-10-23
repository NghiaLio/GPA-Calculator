function renderShell() {
  document.getElementById("app").innerHTML = [
    headerTemplate(),
    dashboardShellTemplate(),
    subjectModalTemplate(),
    pasteModalTemplate(),
    scaleModalTemplate(),
    excelModalTemplate(),
    editScaleModalTemplate(),
    confirmModalTemplate(),
    loginModalTemplate(),
    typeof toolsModalTemplate === "function" ? toolsModalTemplate() : "",
  ].join("");

  if (typeof updateHeaderUserUI === "function") {
    updateHeaderUserUI(typeof currentUser !== "undefined" ? currentUser : null);
  }
  if (typeof updateThemeButton === "function") updateThemeButton();
  if (typeof refreshInstallButton === "function") refreshInstallButton();
  if (typeof updateHistoryButtons === "function") updateHistoryButtons();
}