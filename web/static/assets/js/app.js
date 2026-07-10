renderShell();
renderScaleModalUI();
renderAll();
checkLoginPrompt();

if (typeof startTourIfNeeded === "function") {
  startTourIfNeeded();
}
