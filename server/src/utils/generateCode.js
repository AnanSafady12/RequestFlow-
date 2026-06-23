// utils/generateCode.js
// This file has one job: generate a random 6-digit number
// that we send to the user's email for verification.
// Example output: 482731

function generateVerificationCode() {
  // Math.random() gives a decimal between 0 and 1
  // Multiply by 900000 and add 100000 to get a number between 100000 and 999999
  // Math.floor removes the decimal part
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { generateVerificationCode };
