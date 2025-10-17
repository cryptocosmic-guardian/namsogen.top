// Card generation functions
function generateCard(bin, length) {
  let bin2 = "";
  let card = "";
  let card1_l = [];
  let card2_l = [];
  let sum = 0;
  let check_sum = 0;

  // Replace 'x' with random digits and limit to length-1
  for (let i = 0; i < bin.length && bin2.length < length - 1; i++) {
    let char = bin[i].toLowerCase();
    if (char === "x") {
      char = Math.floor(Math.random() * 10);
    }
    bin2 += char;
  }

  // If bin2 is shorter than length-1, append random digits
  while (bin2.length < length - 1) {
    bin2 += Math.floor(Math.random() * 10);
  }

  // Convert bin2 to array of integers and create a copy
  card1_l = bin2.split('').map(Number);
  card2_l = [...card1_l];

  // Double every second digit from right to left
  for (let i = card2_l.length - 1; i >= 0; i -= 2) {
    card2_l[i] *= 2;
    if (card2_l[i] > 9) {
      card2_l[i] -= 9;
    }
  }

  // Calculate sum
  sum = card2_l.reduce((acc, val) => acc + val, 0);

  // Calculate check digit
  check_sum = (10 - (sum % 10)) % 10;

  // Add check digit to card number
  card = bin2 + check_sum;

  return card;
}

function generateMonth() {
  const month = Math.floor(Math.random() * 12) + 1;
  return month.toString().padStart(2, '0');
}

function generateYear() {
  const currentYear = new Date().getFullYear();
  return Math.floor(Math.random() * 17 + currentYear).toString();
}

function generateCCV(bin) {
  const ccvLength = /^3[47]/.test(bin) ? 4 : 3; // Amex has 4-digit CVV
  return Array(ccvLength).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
}

function generate() {
  const bin = document.getElementById("bin").value.trim();
  let ccv = document.getElementById("ccv").value.trim();
  const month = document.getElementById("month").value;
  const year = document.getElementById("year").value;
  let count = parseInt(document.getElementById("count").value) || 20;
  const output = document.getElementById("output");

  if (!bin) {
    alert("Please enter a BIN number");
    return;
  }

  // Determine card length based on BIN
  let cardLength = 16; // Default length
  if (/^3[47]/.test(bin)) {
    cardLength = 15; // American Express
  } else if (/^3[0689]/.test(bin)) {
    cardLength = 14; // Diners Club
  }

  let cards = [];
  const includeDate = document.getElementById("include-date").checked;
  const includeCVV = document.getElementById("include-cvv").checked;
  for (let i = 0; i < count; i++) {
    const generatedCard = generateCard(bin, cardLength);
    let dateStr = "";
    let cvvStr = "";
    let result = generatedCard;
    let parts = [];

    if (includeDate) {
      const generatedMonth = month === "Random" ? generateMonth() : month;
      const generatedYear = year === "Random" ? generateYear() : year;
      parts.push(generatedMonth + "|" + generatedYear);
    }

    if (includeCVV) {
      cvvStr = ccv || generateCCV(bin);
      parts.push(cvvStr);
    }

    if (parts.length > 0) {
      result += "|" + parts.join("|");
    }
    cards.push(result);
  }

  output.value = cards.join('\n');
}

function copyToClipboard() {
  const output = document.getElementById("output");
  output.select();
  document.execCommand("copy");
  
  // Show temporary success message
  const button = document.querySelector('.result-actions button:first-child');
  const originalHTML = button.innerHTML;
  button.innerHTML = '<i class="fas fa-check"></i> Copied!';
  
  setTimeout(() => {
    button.innerHTML = originalHTML;
  }, 2000);
}

function showSaveForm() {
  // Placeholder for save functionality
  alert("Save functionality coming soon!");
}

// App Download Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
  const downloadMenuBtn = document.getElementById('downloadMenuBtn');
  const downloadMenu = document.getElementById('downloadMenu');
  
  downloadMenuBtn.addEventListener('click', function() {
      downloadMenu.classList.toggle('active');
  });
  
  // Close the menu when clicking outside
  document.addEventListener('click', function(event) {
      if (!downloadMenuBtn.contains(event.target) && !downloadMenu.contains(event.target)) {
          downloadMenu.classList.remove('active');
      }
  });
});