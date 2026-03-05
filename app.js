/*
Requirements:
 -Copy button
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