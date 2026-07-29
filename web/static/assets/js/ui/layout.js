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
  ].join("");

  if (typeof updateHeaderUserUI === "function") {
    updateHeaderUserUI(typeof currentUser !== "undefined" ? currentUser : null);
  }
}