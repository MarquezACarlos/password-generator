/*
Requirements:
 -Copy button DONE
 -Save Encrypted DONE
 -Save username DONE
 -Save Identifier (Google.com, email, etc.) DONE

Optional Features/Bonus:
 -Retrieve Passwords
 -Option to store payment information:
    -Card Number & Length (Double check for each type of credit card, and VALID NUMBERS)
    -Expiration Date (Won't store if expired)
    -CVV (PIN Type, some have 3 others have 4)
*/
  //Entropy Calculation
  // for (const set of masterSet){
  //   poolSize += set.length;
  // }

  // const entropy = Math.log2(poolSize**pwLen);
  // document.getElementById("qualityBits").textContent = Math.round(entropy);
  // const MAX_ENTROPY = 128;
  // const percent = Math.min(100, (entropy/MAX_ENTROPY)*100);
  // document.querySelector(".quality__fill").style.width = percent + "%";

const lowerSet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
const upperSet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
const numSet = ["0","1","2","3","4","5","6","7","8","9"];
const specialSet = ["!","@","#","$","%","^","&","*","+","=","/","|","\\",";",":","?","\"","'",",",".","~","`"];
const bracketSet = ["[","]","{","}","(",")"];

const savedEntries = [];

function getPoolSizeFromSettings() {
  let poolSize = 0;

  if (document.getElementById("optUpper").checked) poolSize += upperSet.length;
  if (document.getElementById("optLower").checked) poolSize += lowerSet.length;
  if (document.getElementById("optDigits").checked) poolSize += numSet.length;
  if (document.getElementById("optSpecial").checked) poolSize += specialSet.length;
  if (document.getElementById("optBrackets").checked) poolSize += bracketSet.length;
  if (document.getElementById("optMinus").checked) poolSize += 1;
  if (document.getElementById("optUnderline").checked) poolSize += 1;
  if (document.getElementById("optSpace").checked) poolSize += 1;

  const extra = document.getElementById("includeChars").value || "";
  const uniq = new Set();

  for (const ch of extra) {
    if (ch !== " ") uniq.add(ch);
  }

  poolSize += uniq.size;
  return Math.max(poolSize, 1);
}

function generatePassword() {
  const masterSet = [];
  const includeChars = [];
  let password = "";

  const lengthInput = document.getElementById("length");
  let pwLen = parseInt(lengthInput.value, 10);

  if (!Number.isFinite(pwLen)) pwLen = 20;
  pwLen = Math.max(4, Math.min(128, pwLen));
  lengthInput.value = pwLen;

  if (document.getElementById("optUpper").checked) masterSet.push(upperSet);
  if (document.getElementById("optLower").checked) masterSet.push(lowerSet);
  if (document.getElementById("optDigits").checked) masterSet.push(numSet);
  if (document.getElementById("optMinus").checked) includeChars.push("-");
  if (document.getElementById("optUnderline").checked) includeChars.push("_");
  if (document.getElementById("optSpace").checked) includeChars.push(" ");
  if (document.getElementById("optSpecial").checked) masterSet.push(specialSet);
  if (document.getElementById("optBrackets").checked) masterSet.push(bracketSet);

  const customChars = document.getElementById("includeChars").value || "";
  for (const char of customChars) {
    if (char !== " ") includeChars.push(char);
  }

  if (includeChars.length > 0) masterSet.push(includeChars);

  if (masterSet.length === 0) {
    alert("Please select at least one character set.");
    return;
  }

  const pwSeed = new Uint32Array(pwLen);
  crypto.getRandomValues(pwSeed);

  for (const num of pwSeed) {
    const i = num % masterSet.length;
    const source = masterSet[i];
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % source.length;
    password += source[j];
  }

  const pwBox = document.getElementById("passwordOut");
  const toggleBtn = document.getElementById("toggleView");

  pwBox.value = password;
  pwBox.type = "text";
  toggleBtn.textContent = "Hide";

  updateQuality(password);
}

async function copyPassword() {
  const copyText = document.getElementById("passwordOut");
  if (!copyText.value) return;

  try {
    await navigator.clipboard.writeText(copyText.value);
  } catch (err) {
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
  }
}

function updateQuality(pw) {
  const L = pw.length;
  const qualityChars = document.getElementById("qualityChars");
  const qualityBits = document.getElementById("qualityBits");
  const qualityFill = document.querySelector(".quality__fill");

  if (qualityChars) qualityChars.textContent = String(L);

  if (L === 0) {
    qualityBits.textContent = "0";
    qualityFill.style.width = "0%";
    return;
  }

  const counts = new Map();
  for (const ch of pw) counts.set(ch, (counts.get(ch) || 0) + 1);

  let H = 0;
  for (const c of counts.values()) {
    const p = c / L;
    H += -p * Math.log2(p);
  }

  let bits = H * L;

  const maxRun = (() => {
    let best = 1;
    let run = 1;

    for (let i = 1; i < pw.length; i++) {
      if (pw[i] === pw[i - 1]) {
        run++;
      } else {
        best = Math.max(best, run);
        run = 1;
      }
    }

    return Math.max(best, run);
  })();

  if (maxRun >= 4) bits *= 0.85;
  if (maxRun >= 8) bits *= 0.70;
  if (maxRun >= 12) bits *= 0;

  const poolSize = getPoolSizeFromSettings();
  const poolBits = L * Math.log2(poolSize);
  bits = Math.min(bits, poolBits);

  qualityBits.textContent = String(Math.round(bits));

  const strongBits = 80;
  let pct = Math.max(0, Math.min(100, (bits / strongBits) * 100));
  if (L < 8) pct = Math.min(pct, 25);

  qualityFill.style.width = pct + "%";
}

function _downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
}

function _esc(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    "\"":"&quot;",
    "'":"&#39;"
  }[c]));
}

function cleanCardNumber(value) {
  return value.replace(/\D/g, "");
}

function detectCardBrand(number) {
  if (/^4\d{12}(\d{3})?(\d{3})?$/.test(number)) return "Visa";
  if (/^(5[1-5]\d{14})$/.test(number)) return "Mastercard";
  if (/^(222[1-9]\d{12}|22[3-9]\d{13}|2[3-6]\d{14}|27[01]\d{13}|2720\d{12})$/.test(number)) return "Mastercard";
  if (/^3[47]\d{13}$/.test(number)) return "AMEX";
  if (/^(6011\d{12}|65\d{14}|64[4-9]\d{13})$/.test(number)) return "Discover";
  return null;
}

function passesLuhn(number) {
  let sum = 0;
  let shouldDouble = false;

  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function isExpired(expMonth, expYear) {
  const month = parseInt(expMonth, 10);
  const year = parseInt(expYear, 10);

  if (!month || !year || month < 1 || month > 12) return true;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (year < currentYear) return true;
  if (year === currentYear && month < currentMonth) return true;

  return false;
}

function isValidCvv(cvv, brand) {
  if (!/^\d+$/.test(cvv)) return false;
  if (brand === "AMEX") return /^\d{4}$/.test(cvv);
  return /^\d{3}$/.test(cvv);
}

function getCardDataFromForm() {
  const attachCard = document.getElementById("attachCard").checked;
  if (!attachCard) return null;

  const label = document.getElementById("cardLabel").value.trim();
  const cardholder = document.getElementById("cardholder").value.trim();
  const cardNumberRaw = document.getElementById("cardNumber").value.trim();
  const expMonth = document.getElementById("expMonth").value.trim();
  const expYear = document.getElementById("expYear").value.trim();
  const cvv = document.getElementById("cvv").value.trim();

  const cardNumber = cleanCardNumber(cardNumberRaw);
  const brand = detectCardBrand(cardNumber);

  if (!label || !cardholder || !cardNumber || !expMonth || !expYear || !cvv) {
    alert("Please fill out all credit card fields or uncheck the credit card option.");
    return false;
  }

  if (!brand) {
    alert("Unsupported or invalid card type.");
    return false;
  }

  if (!passesLuhn(cardNumber)) {
    alert("Invalid card number.");
    return false;
  }

  if (isExpired(expMonth, expYear)) {
    alert("This card is expired and will not be stored.");
    return false;
  }

  if (!isValidCvv(cvv, brand)) {
    alert(`${brand} requires a ${brand === "AMEX" ? "4-digit" : "3-digit"} CVV.`);
    return false;
  }

  return {
    label,
    cardholder,
    brand,
    cardNumber,
    last4: cardNumber.slice(-4),
    expMonth: expMonth.padStart(2, "0"),
    expYear,
    cvv
  };
}

function getEntryFromForm() {
  const website = document.getElementById("website").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("passwordOut").value;

  if (!website || !username || !password) {
    alert("Please fill in Website, Username, and Password before adding.");
    return null;
  }

  const card = getCardDataFromForm();
  if (card === false) return null;

  return {
    type: "password",
    website,
    username,
    password,
    card,
    savedAt: new Date().toISOString()
  };
}

function addEntryToQueue() {
  const entry = getEntryFromForm();
  if (!entry) return;

  savedEntries.push(entry);
  _renderQueue();
  resetAllFields();
}

function resetAllFields() {
  document.getElementById("website").value = "";
  document.getElementById("username").value = "";
  document.getElementById("passwordOut").value = "";
  document.getElementById("passwordOut").type = "password";
  document.getElementById("toggleView").textContent = "Show";

  document.getElementById("attachCard").checked = false;
  toggleCardSubsection(false);

  document.getElementById("cardLabel").value = "";
  document.getElementById("cardholder").value = "";
  document.getElementById("cardNumber").value = "";
  document.getElementById("expMonth").value = "";
  document.getElementById("expYear").value = "";
  document.getElementById("cvv").value = "";

  updateCardHints();
  updateQuality("");
}

function getEntrySearchText(entry) {
  const cardText = entry.card
    ? `${entry.card.label} ${entry.card.cardholder} ${entry.card.brand} ${entry.card.last4}`
    : "";

  return `${entry.website} ${entry.username} ${cardText}`.toLowerCase();
}

function getRowSecretState(entry) {
  if (entry._viewState) return entry._viewState;
  return "hidden";
}

function setRowSecretState(entry, state) {
  entry._viewState = state;
}

function getCardHiddenText(card) {
  return `${card.brand} •••• ${card.last4}`;
}

function getCardShownText(card) {
  return `Card: ${card.cardNumber} | Exp: ${card.expMonth}/${card.expYear} | CVV: ${card.cvv}`;
}

function _renderQueue(entriesToRender = savedEntries) {
  const list = document.getElementById("queueList");
  const section = document.getElementById("queueSection");
  const count = document.getElementById("queueCount");

  list.innerHTML = "";
  count.textContent = savedEntries.length;
  section.style.display = savedEntries.length ? "block" : "none";

  entriesToRender.forEach((entry) => {
    const idx = savedEntries.indexOf(entry);
    const row = document.createElement("div");
    row.className = "queue-row";

    const state = getRowSecretState(entry);
    let secretText = "••••••••";

    if (state === "password") {
      secretText = entry.password;
    } else if (state === "card" && entry.card) {
      secretText = getCardShownText(entry.card);
    }

    row.innerHTML = `
      <span class="queue-site">${_esc(entry.website)}</span>
      <span class="queue-user">${_esc(entry.username)}</span>
      <span class="queue-pw mono" id="entry-${idx}">${_esc(secretText)}</span>
      <span class="queue-actions">
        <select class="queue-select" onchange="setQueueSecretView(${idx}, this.value)">
          <option value="hidden" ${state === "hidden" ? "selected" : ""}>Hidden</option>
          <option value="password" ${state === "password" ? "selected" : ""}>Password</option>
          ${entry.card ? `<option value="card" ${state === "card" ? "selected" : ""}>Card</option>` : ""}
        </select>

        <button class="btn btn--ghost queue-copy" type="button" onclick="copyQueueSecret(${idx})">Copy</button>
        <button class="btn btn--ghost queue-remove" type="button" onclick="removeEntry(${idx})">X</button>
      </span>
    `;

    list.appendChild(row);
  });
}

function setQueueSecretView(index, value) {
  const entry = savedEntries[index];
  if (!entry) return;

  if (value === "card" && !entry.card) {
    setRowSecretState(entry, "hidden");
  } else {
    setRowSecretState(entry, value);
  }

  const searchInput = document.getElementById("queueSearch");
  if (searchInput && searchInput.value.trim() !== "") {
    filterQueueEntries();
  } else {
    _renderQueue();
  }
}

async function copyQueueSecret(index) {
  const entry = savedEntries[index];
  if (!entry) return;

  const state = getRowSecretState(entry);
  let textToCopy = "";

  if (state === "password") {
    textToCopy = entry.password;
  } else if (state === "card" && entry.card) {
    textToCopy =
`Card Label: ${entry.card.label}
Cardholder: ${entry.card.cardholder}
Brand: ${entry.card.brand}
Card Number: ${entry.card.cardNumber}
Expiration: ${entry.card.expMonth}/${entry.card.expYear}
CVV: ${entry.card.cvv}`;
  } else {
    alert("Choose Password or Card from the dropdown first.");
    return;
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
  } catch (err) {
    const temp = document.createElement("textarea");
    temp.value = textToCopy;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
  }
}

function filterQueueEntries() {
  const searchInput = document.getElementById("queueSearch");
  if (!searchInput) return;

  const term = searchInput.value.trim().toLowerCase();

  if (!term) {
    _renderQueue();
    return;
  }

  const filtered = savedEntries.filter(entry => getEntrySearchText(entry).includes(term));
  _renderQueue(filtered);
}

function removeEntry(idx) {
  savedEntries.splice(idx, 1);

  const searchInput = document.getElementById("queueSearch");
  if (searchInput && searchInput.value.trim() !== "") {
    filterQueueEntries();
  } else {
    _renderQueue();
  }
}

function exportPlain() {
  if (!savedEntries.length) {
    alert('No entries queued. Use "Add to Queue" first.');
    return;
  }

  const blob = new Blob([JSON.stringify(savedEntries, null, 2)], { type: "application/json" });
  _downloadBlob(blob, "passwords.json");
}

async function exportEncrypted() {
  if (!savedEntries.length) {
    alert('No entries queued. Use "Add to Queue" first.');
    return;
  }

  try {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const aesKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", aesKey));
    const sanitizedEntries = savedEntries.map(entry => {
      const clone = structuredClone(entry);
      delete clone._viewState;
      return clone;
    });

    const plaintext = enc.encode(JSON.stringify(sanitizedEntries));
    const ciphertext = new Uint8Array(
      await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, plaintext)
    );

    const magic = new Uint8Array([0x50, 0x57, 0x47, 0x45]);
    const fileData = new Uint8Array(magic.length + rawKey.length + iv.length + ciphertext.length);

    let o = 0;
    fileData.set(magic, o); o += magic.length;
    fileData.set(rawKey, o); o += rawKey.length;
    fileData.set(iv, o); o += iv.length;
    fileData.set(ciphertext, o);

    _downloadBlob(new Blob([fileData], { type: "application/octet-stream" }), "passwords.enc");
  } catch (err) {
    alert("Encryption failed: " + err.message);
    console.error(err);
  }
}

async function importEncrypted(file) {
  if (!file) return;

  try {
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);

    const MAGIC = [0x50, 0x57, 0x47, 0x45];
    for (let i = 0; i < 4; i++) {
      if (data[i] !== MAGIC[i]) {
        alert("Invalid file: not a PWGE encrypted file.");
        return;
      }
    }

    let o = 4;
    const rawKey = data.slice(o, o + 32); o += 32;
    const iv = data.slice(o, o + 12); o += 12;
    const ciphertext = data.slice(o);

    const aesKey = await crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const plainBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      aesKey,
      ciphertext
    );

    const entries = JSON.parse(new TextDecoder().decode(plainBuffer));

    if (!Array.isArray(entries) || entries.length === 0) {
      alert("File decrypted successfully but contained no entries.");
      return;
    }

    let added = 0;

    for (const e of entries) {
      if (e.website && e.username && e.password) {
        const normalized = {
          type: "password",
          website: e.website,
          username: e.username,
          password: e.password,
          card: e.card || null,
          savedAt: e.savedAt || new Date().toISOString()
        };
        savedEntries.push(normalized);
        added++;
      }
    }

    _renderQueue();

    const searchWrap = document.getElementById("queueSearchWrap");
    if (searchWrap) searchWrap.style.display = "block";

    _setImportStatus(`Loaded ${added} entr${added === 1 ? "y" : "ies"} from "${file.name}"`);
  } catch (err) {
    console.error(err);
    _setImportStatus("Decryption failed — wrong file or corrupted data.");
  }

  document.getElementById("importFileInput").value = "";
}

function _setImportStatus(msg) {
  const el = document.getElementById("importStatus");
  if (el) el.textContent = msg;
}

function triggerImport() {
  document.getElementById("importFileInput").click();
}

function toggleCardSubsection(show) {
  const section = document.getElementById("cardSubsection");
  section.style.display = show ? "flex" : "none";
}

function updateCardHints() {
  const cardNumber = cleanCardNumber(document.getElementById("cardNumber").value);
  const brand = detectCardBrand(cardNumber);
  const brandHint = document.getElementById("cardBrandHint");
  const cvvHint = document.getElementById("cvvHint");

  if (!brand) {
    brandHint.textContent = "Brand: Unknown";
    cvvHint.textContent = "CVV depends on card type";
    return;
  }

  brandHint.textContent = `Brand: ${brand}`;
  if (brand === "AMEX") {
    cvvHint.textContent = "AMEX uses 4-digit CVV";
  } else {
    cvvHint.textContent = `${brand} uses 3-digit CVV`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const lengthInput = document.getElementById("length");
  const pwBox = document.getElementById("passwordOut");
  const toggleBtn = document.getElementById("toggleView");
  const queueSearchWrap = document.getElementById("queueSearchWrap");
  const queueSearch = document.getElementById("queueSearch");
  const attachCard = document.getElementById("attachCard");
  const cardNumberInput = document.getElementById("cardNumber");
  const cvvInput = document.getElementById("cvv");
  const expMonthInput = document.getElementById("expMonth");
  const expYearInput = document.getElementById("expYear");

  const refresh = () => updateQuality(pwBox.value);

  pwBox.addEventListener("input", refresh);
  pwBox.addEventListener("change", refresh);
  pwBox.addEventListener("keyup", refresh);
  pwBox.addEventListener("paste", () => setTimeout(refresh, 0));
  pwBox.addEventListener("cut", () => setTimeout(refresh, 0));
  pwBox.addEventListener("focus", refresh);

  const settingsIds = [
    "optUpper","optLower","optDigits","optMinus","optUnderline","optSpace",
    "optSpecial","optBrackets","includeChars"
  ];

  for (const id of settingsIds) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.addEventListener("input", refresh);
    el.addEventListener("change", refresh);
  }

  lengthInput.addEventListener("input", () => {
    lengthInput.value = lengthInput.value.replace(/\D/g, "");
    refresh();
  });

  toggleBtn.addEventListener("click", () => {
    if (pwBox.type === "text") {
      pwBox.type = "password";
      toggleBtn.textContent = "Show";
    } else {
      pwBox.type = "text";
      toggleBtn.textContent = "Hide";
    }
  });

  attachCard.addEventListener("change", () => {
    toggleCardSubsection(attachCard.checked);
  });

  if (queueSearchWrap) {
    queueSearchWrap.style.display = "none";
  }

  if (queueSearch) {
    queueSearch.addEventListener("input", filterQueueEntries);
  }

  cardNumberInput.addEventListener("input", () => {
    cardNumberInput.value = cardNumberInput.value.replace(/[^\d\s-]/g, "");
    updateCardHints();
  });

  cvvInput.addEventListener("input", () => {
    cvvInput.value = cvvInput.value.replace(/\D/g, "").slice(0, 4);
  });

  expMonthInput.addEventListener("input", () => {
    expMonthInput.value = expMonthInput.value.replace(/\D/g, "").slice(0, 2);
  });

  expYearInput.addEventListener("input", () => {
    expYearInput.value = expYearInput.value.replace(/\D/g, "").slice(0, 4);
  });

  updateCardHints();
  toggleCardSubsection(false);
  refresh();
});