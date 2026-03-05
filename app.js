// UI TEMPLATE ONLY
// No password generation, entropy calculation, or clipboard logic is implemented here.

document.addEventListener("DOMContentLoaded", () => {
  const lengthInput = document.getElementById("length");
  const lengthHint = document.getElementById("lengthHint");
  const previewLength = document.getElementById("previewLength");
  const qualityChars = document.getElementById("qualityChars");

  // Tabs (left panel)
  const tabButtons = document.querySelectorAll(".card:first-of-type .tab[data-tab]");
  const panels = {
    settings: document.getElementById("tab-settings"),
    advanced: document.getElementById("tab-advanced"),
    preview: document.getElementById("tab-preview"),
  };

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("tab--active"));
      btn.classList.add("tab--active");

      const key = btn.dataset.tab;
      Object.entries(panels).forEach(([k, el]) => {
        const isActive = (k === key);
        el.hidden = !isActive;
        el.classList.toggle("tabpanel--active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
      });
    });
  });

  // Mode switching (charset / pattern / custom) - UI enable/disable only
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const modeBlocks = document.querySelectorAll(".indent[data-mode]");

  const setModeUI = (mode) => {
    modeBlocks.forEach(block => {
      const isThis = block.dataset.mode === mode;
      block.classList.toggle("is-disabled", !isThis);

      // Enable/disable inputs inside blocks purely for UI realism
      block.querySelectorAll("input, select, button, textarea").forEach(el => {
        el.disabled = !isThis;
      });
    });

    // Update preview label
    const previewMode = document.getElementById("previewMode");
    if (previewMode) {
      previewMode.textContent =
        mode === "charset" ? "Character Set" :
        mode === "pattern" ? "Pattern" :
        "Custom Algorithm";
    }
  };

  modeRadios.forEach(r => {
    r.addEventListener("change", () => {
      if (r.checked) setModeUI(r.value);
    });
  });

  // Initialize mode UI
  const checked = Array.from(modeRadios).find(r => r.checked)?.value || "charset";
  setModeUI(checked);

  // Length display (UI only)
  const syncLength = () => {
    const v = lengthInput.value || "20";
    lengthHint.textContent = v;
    if (previewLength) previewLength.textContent = v;
    if (qualityChars) qualityChars.textContent = v;
  };

  lengthInput.addEventListener("input", syncLength);
  syncLength();
});