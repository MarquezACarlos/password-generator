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


// var upper = document.getElementById("optUpper").checked;
//   if (upper){
//     alert("yes");
//   }
//   alert(document.getElementById("optUpper").value);

const charSet = ["a", "b","c", "d","e", "f","g", "h","i", "j","k", "l","m", "n","o", "p","q", "r","s", "t","u", "v","w", "x","y", "z"];
const numSet = ["0","1","2","3","4","5","6","7","8","9"];
const specialSet = ["!","@","#","$","%","^","&","*","+","=", "/", "|", "\\", ";", ":", "?", "\"", "\'", ",", ".", "~", "`"]; //22

function generatePassword(){
  var password = "";
  const pwLen = document.getElementById("length").value;
 
  const pwSeed = new Uint32Array(pwLen);
  self.crypto.getRandomValues(pwSeed);
  for (const num of pwSeed){
      const set = num%4;
      if(set == 0){
        password += charSet[num%26];
        document.getElementById("passwordOut").value = password;
      }
      else if (set == 1){
        password += numSet[num%10];
        document.getElementById("passwordOut").value = password;
      }
      else if (set == 2){
        password += specialSet[num%22];
        document.getElementById("passwordOut").value = password;
      }
      else{
        password += charSet[num%26].toUpperCase();
        document.getElementById("passwordOut").value = password;
      }
  }
  
  
  
};

// document.getElementById("PRESSED").onclick = function() {
//   alert("lets go");
// };


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