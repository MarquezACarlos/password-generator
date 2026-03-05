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

// for (const num of pwSeed){
      // const set = num%4;
      // if(set == 0){
      //   password += charSet[num%26];
      //   document.getElementById("passwordOut").value = password;
      // }
      // else if (set == 1){
      //   password += numSet[num%10];
      //   document.getElementById("passwordOut").value = password;
      // }
      // else if (set == 2){
      //   password += specialSet[num%22];
      //   document.getElementById("passwordOut").value = password;
      // }
      // else{
      //   password += charSet[num%26].toUpperCase();
      //   document.getElementById("passwordOut").value = password;
      // }
// var upper = document.getElementById("optUpper").checked;
//   if (upper){
//     alert("yes");
//   }
//   alert(document.getElementById("optUpper").value);

const lowerSet = ["a", "b","c", "d","e", "f","g", "h","i", "j","k", "l","m", "n","o", "p","q", "r","s", "t","u", "v","w", "x","y", "z"];
const upperSet = ["A", "B","C", "D","E", "F","G", "H","I", "J","K", "L","M", "N","O", "P","Q", "R","S", "T","U", "V","W", "X","Y", "Z"];
const numSet = ["0","1","2","3","4","5","6","7","8","9"];
const specialSet = ["!","@","#","$","%","^","&","*","+","=", "/", "|", "\\", ";", ":", "?", "\"", "\'", ",", ".", "~", "`"]; //22
const bracketSet = ["[", "]", "{", "}", "(", ")"];


function generatePassword(){
  const masterSet = [];
  const includeChars = [];
  var password = "";
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
    document.getElementById("passwordOut").value = password;
  }
};

function copyPassword(){
  var copyText = document.getElementById("passwordOut");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(copyText.value);
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