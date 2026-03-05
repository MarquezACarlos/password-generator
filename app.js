document.addEventListener("DOMContentLoaded", () => {
  const lengthInput = document.getElementById("length");
  const lengthHint = document.getElementById("lengthHint");
  const qualityChars = document.getElementById("qualityChars");

  const syncLength = () => {
    const v = lengthInput.value || "20";
    lengthHint.textContent = v;
    if (qualityChars) qualityChars.textContent = v;
  };

  lengthInput.addEventListener("input", syncLength);
  syncLength();
});