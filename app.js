/*
Requirements:
 -Copy button DONE
 -Save Encrypted
 -Save username
 -Save Identifier (Google.com, email, etc.)

Optional Features/Bonus:
 -Retrieve Passwords
 -Option to store payment information:
    -Card Number & Length (Double check for each type of credit card, and VALID NUMBERS)
    -Expiration Date (Won't store if expired)
    -CVV (PIN Type, some have 3 others have 4)
 -Retrieve Passwords
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

const lowerSet = ["a", "b","c", "d","e", "f","g", "h","i", "j","k", "l","m", "n","o", "p","q", "r","s", "t","u", "v","w", "x","y", "z"];
const upperSet = ["A", "B","C", "D","E", "F","G", "H","I", "J","K", "L","M", "N","O", "P","Q", "R","S", "T","U", "V","W", "X","Y", "Z"];
const numSet = ["0","1","2","3","4","5","6","7","8","9"];
const specialSet = ["!","@","#","$","%","^","&","*","+","=", "/", "|", "\\", ";", ":", "?", "\"", "\'", ",", ".", "~", "`"]; //22
const bracketSet = ["[", "]", "{", "}", "(", ")"];

function getPoolSizeFromSettings(){
  let poolSize = 0;

  if (document.getElementById("optUpper").checked) poolSize += upperSet.length;
  if (document.getElementById("optLower").checked) poolSize += lowerSet.length;
  if (document.getElementById("optDigits").checked) poolSize += numSet.length;
  if (document.getElementById("optSpecial").checked) poolSize += specialSet.length;
  if (document.getElementById("optBrackets").checked) poolSize += bracketSet.length;

  // single-char toggles
  if (document.getElementById("optMinus").checked) poolSize += 1;
  if (document.getElementById("optUnderline").checked) poolSize += 1;
  if (document.getElementById("optSpace").checked) poolSize += 1;

  // includeChars text box: count UNIQUE non-space chars
  const extra = document.getElementById("includeChars").value || "";
  const uniq = new Set();
  for (const ch of extra) {
    if (ch !== " ") uniq.add(ch);
  }
  poolSize += uniq.size;

  return Math.max(poolSize, 1);
}

function generatePassword(){
  const masterSet = [];
  const includeChars = [];
  var password = "";
  let poolSize = 0;
  const pwLen = document.getElementById("length").value;

  if(document.getElementById("optUpper").checked) masterSet.push(upperSet);
  if(document.getElementById("optLower").checked) masterSet.push(lowerSet);
  if(document.getElementById("optDigits").checked) masterSet.push(numSet);
  if(document.getElementById("optMinus").checked) includeChars.push("-");
  if(document.getElementById("optUnderline").checked) includeChars.push("_");
  if(document.getElementById("optSpace").checked) includeChars.push(" ");
  if(document.getElementById("optSpecial").checked) masterSet.push(specialSet);
  if(document.getElementById("optBrackets").checked) masterSet.push(bracketSet);
  if(document.getElementById("includeChars").value != ""){
    const chars = document.getElementById("includeChars").value;
    for(const char of chars){
      if(char == " ") continue;
      else includeChars.push(char);
    }
  }
  if(includeChars.length > 0) masterSet.push(includeChars);

  const pwSeed = new Uint32Array(pwLen);
  self.crypto.getRandomValues(pwSeed);
  
  for(const num of pwSeed){
    const i = num%masterSet.length;
    const j = Math.floor((Math.random()*masterSet[i].length));
    password += masterSet[i][j];
  }

  const pwBox = document.getElementById("passwordOut");
  const toggleBtn = document.getElementById("toggleView");

  pwBox.value = password;
  pwBox.type = "text";
  toggleBtn.textContent = "Hide";

  document.getElementById("passwordOut").value = password;
  updateQuality(password);
}

function copyPassword(){
  var copyText = document.getElementById("passwordOut");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(copyText.value);
}

function updateQuality(pw){
  const L = pw.length;
  const qualityChars = document.getElementById("qualityChars");
  if(qualityChars) qualityChars.textContent = String(L);

  // Guard
  if (L === 0) {
    document.getElementById("qualityBits").textContent = "0";
    document.querySelector(".quality__fill").style.width = "0%";
    return;
  }

  // Frequency map
  const counts = new Map();
  for (const ch of pw) counts.set(ch, (counts.get(ch) || 0) + 1);

  // Shannon entropy per character
  let H = 0;
  for (const c of counts.values()) {
    const p = c / L;
    H += -p * Math.log2(p);
  }

  // Total bits estimate
  let bits = H * L;

  // Optional: extra penalty for long runs of the same character (e.g., "ssssss")
  const maxRun = (() => {
    let best = 1, run = 1;
    for (let i = 1; i < pw.length; i++) {
      if (pw[i] === pw[i - 1]) run++;
      else { best = Math.max(best, run); run = 1; }
    }
    return Math.max(best, run);
  })();

  if (maxRun >= 4) bits *= 0.85;   // mild penalty
  if (maxRun >= 8) bits *= 0.70;   // stronger penalty
  if (maxRun >= 12) bits *= 0;     // severe penalty

  // Update UI
  document.getElementById("qualityBits").textContent = String(Math.round(bits));

  const poolSize = getPoolSizeFromSettings();
  const poolBits = L * Math.log2(poolSize);
  bits = Math.min(bits, poolBits); 
  document.getElementById("qualityBits").textContent = String(Math.round(bits));
  const strongBits = 80;
  let pct = Math.max(0, Math.min(100, (bits / strongBits) * 100));
  if (L < 8) pct = Math.min(pct, 25);
  document.querySelector(".quality__fill").style.width = pct + "%";
}

// ── Entry Queue ───────────────────────────────────────────────────────────────

const savedEntries = [];

function _downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
}

function _getSaveEntry() {
  const website  = document.getElementById("website").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("passwordOut").value;

  if (!website || !username || !password) {
    alert("Please fill in Website, Username, and Password before adding.");
    return null;
  }
  return { website, username, password, savedAt: new Date().toISOString() };
}

function _esc(str) {
  return str.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function _renderQueue() {
  const list    = document.getElementById("queueList");
  const section = document.getElementById("queueSection");
  const count   = document.getElementById("queueCount");

  list.innerHTML = "";
  count.textContent = savedEntries.length;
  section.style.display = savedEntries.length ? "block" : "none";

  savedEntries.forEach((entry, idx) => {
    const row = document.createElement("div");
    row.className = "queue-row";
    row.innerHTML = `
      <span class="queue-site">${_esc(entry.website)}</span>
      <span class="queue-user">${_esc(entry.username)}</span>
      <span class="queue-pw mono">••••••••</span>
      <button class="btn btn--ghost queue-remove" title="Remove" onclick="removeEntry(${idx})">✕</button>
    `;
    list.appendChild(row);
  });
}

function addToQueue() {
  const entry = _getSaveEntry();
  if (!entry) return;
  savedEntries.push(entry);
  _renderQueue();
  // Clear fields for the next entry
  document.getElementById("website").value     = "";
  document.getElementById("username").value    = "";
  document.getElementById("passwordOut").value = "";
  updateQuality("");
}

function removeEntry(idx) {
  savedEntries.splice(idx, 1);
  _renderQueue();
}

// ── Export Plain JSON ─────────────────────────────────────────────────────────

function exportPlain() {
  if (!savedEntries.length) { alert("No entries queued. Use \"Add to Queue\" first."); return; }
  const blob = new Blob([JSON.stringify(savedEntries, null, 2)], { type: "application/json" });
  _downloadBlob(blob, "passwords.json");
}

// ── Export Encrypted (AES-GCM, self-contained) ────────────────────────────────
// File format: [4-byte magic "PWGE"][32-byte raw AES key][12-byte IV][ciphertext]

async function exportEncrypted() {
  if (!savedEntries.length) { alert("No entries queued. Use \"Add to Queue\" first."); return; }

  try {
    const enc    = new TextEncoder();
    const iv     = crypto.getRandomValues(new Uint8Array(12));
    const aesKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
    );
    const rawKey     = new Uint8Array(await crypto.subtle.exportKey("raw", aesKey));
    const plaintext  = enc.encode(JSON.stringify(savedEntries));
    const ciphertext = new Uint8Array(
      await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, plaintext)
    );

    const magic    = new Uint8Array([0x50, 0x57, 0x47, 0x45]); // "PWGE"
    const fileData = new Uint8Array(magic.length + rawKey.length + iv.length + ciphertext.length);
    let o = 0;
    fileData.set(magic,      o); o += magic.length;
    fileData.set(rawKey,     o); o += rawKey.length;
    fileData.set(iv,         o); o += iv.length;
    fileData.set(ciphertext, o);

    _downloadBlob(new Blob([fileData], { type: "application/octet-stream" }), "passwords.enc");
  } catch (err) {
    alert("Encryption failed: " + err.message);
    console.error(err);
  }
}

// ── Import & Decrypt .enc File ────────────────────────────────────────────────
// Reads a PWGE file, extracts the embedded AES key + IV, decrypts the payload,
// and loads all entries into the queue so they can be edited or re-exported.

async function importEncrypted(file) {
  if (!file) return;

  try {
    const buffer  = await file.arrayBuffer();
    const data    = new Uint8Array(buffer);

    // Validate magic bytes "PWGE"
    const MAGIC = [0x50, 0x57, 0x47, 0x45];
    for (let i = 0; i < 4; i++) {
      if (data[i] !== MAGIC[i]) {
        alert("Invalid file: not a PWGE encrypted file.");
        return;
      }
    }

    // Unpack: [magic(4)][rawKey(32)][iv(12)][ciphertext(rest)]
    let o = 4;
    const rawKey     = data.slice(o, o + 32); o += 32;
    const iv         = data.slice(o, o + 12); o += 12;
    const ciphertext = data.slice(o);

    // Re-import the AES key
    const aesKey = await crypto.subtle.importKey(
      "raw", rawKey,
      { name: "AES-GCM", length: 256 },
      false, ["decrypt"]
    );

    // Decrypt
    const plainBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv }, aesKey, ciphertext
    );

    const entries = JSON.parse(new TextDecoder().decode(plainBuffer));

    if (!Array.isArray(entries) || entries.length === 0) {
      alert("File decrypted successfully but contained no entries.");
      return;
    }

    // Merge into queue (append — don't wipe existing entries)
    let added = 0;
    for (const e of entries) {
      if (e.website && e.username && e.password) {
        savedEntries.push(e);
        added++;
      }
    }

    _renderQueue();
    _setImportStatus(`✔ Loaded ${added} entr${added === 1 ? "y" : "ies"} from "${file.name}"`);

  } catch (err) {
    console.error(err);
    _setImportStatus("✖ Decryption failed — wrong file or corrupted data.");
  }

  // Reset the file input so the same file can be re-imported if needed
  document.getElementById("importFileInput").value = "";
}

function _setImportStatus(msg) {
  const el = document.getElementById("importStatus");
  if (el) el.textContent = msg;
}

function triggerImport() {
  document.getElementById("importFileInput").click();
}

function resetFields(){
var elements = document.getElementsByTagName("input");
for (var ii=0; ii < elements.length; ii++) {
  if (elements[ii].type == "text") {
    elements[ii].value = "";
  }
}

}

document.addEventListener("DOMContentLoaded", () => {
  const lengthInput = document.getElementById("length");
  const lengthHint  = document.getElementById("lengthHint");
  const pwBox       = document.getElementById("passwordOut");

  const refresh = () => updateQuality(pwBox.value);

  pwBox.addEventListener("input", refresh);                 
  pwBox.addEventListener("change", refresh);                
  pwBox.addEventListener("keyup", refresh);                 
  pwBox.addEventListener("paste", () => setTimeout(refresh, 0)); 
  pwBox.addEventListener("cut",   () => setTimeout(refresh, 0)); 
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
  });

  const toggleBtn = document.getElementById("toggleView");

  toggleBtn.addEventListener("click", () => {
    if (pwBox.type === "text") {
      pwBox.type = "password";
      toggleBtn.textContent = "Show";
    } else {
      pwBox.type = "text";
      toggleBtn.textContent = "Hide";
    }
  });
  refresh();
});