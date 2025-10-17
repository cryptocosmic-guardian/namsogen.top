document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('bin-lookup-form');
  const resultDiv = document.getElementById('bin-lookup-result'); // Target the main result/error div
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonHTML = submitButton.innerHTML; 

  // HTML structure for successful results
  const successResultHTML = `
      <hr> 
      <h3 class="h6 text-muted mb-3">Lookup Results:</h3>
      <div class="row g-3 result-grid"> 
          <div class="col-sm-6 col-md-4 result-item"><strong>BIN</strong><span class="bin-number"></span></div>
          <div class="col-sm-6 col-md-4 result-item"><strong>Brand</strong><span class="vendor-name"></span></div>
          <div class="col-sm-6 col-md-4 result-item"><strong>Bank</strong><span class="bank-name"></span></div>
          <div class="col-sm-6 col-md-4 result-item"><strong>Type</strong><span class="bin-type"></span></div>
          <div class="col-sm-6 col-md-4 result-item"><strong>Level</strong><span class="card-level"></span></div>
          <div class="col-sm-6 col-md-4 result-item"><strong>Country</strong><span class="country-name"></span></div>
      </div>
  `;

  form.addEventListener('submit', function (e) {
    e.preventDefault(); 
    resultDiv.style.display = 'none'; // Hide result area initially
    resultDiv.innerHTML = ''; // Clear previous content

    const binValue = form.querySelector('input[name="bin"]').value;
    
    let recaptchaToken = '';
     if (typeof grecaptcha !== 'undefined') {
        recaptchaToken = grecaptcha.getResponse();
     }

    // Basic reCAPTCHA check - display error in resultDiv
    if (!recaptchaToken && typeof grecaptcha !== 'undefined' && grecaptcha.getResponse().length === 0) {
       resultDiv.innerHTML = `<div class="bin-lookup-error-message"><i class="fas fa-exclamation-triangle"></i> Please complete the reCAPTCHA.</div>`;
       resultDiv.style.display = 'block'; // Show the error message
       return; 
    }

    const payload = new URLSearchParams({
      bin: binValue,
      'g-recaptcha-response': recaptchaToken
    });

    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Looking up...';

    fetch('https://lind.uno/bins.php', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: payload.toString()
    })
    .then(res => {
        if (!res.ok) {
           return res.text().then(text => {
               // Use the Portuguese error message for fetch/network errors as requested
               throw new Error("Erro ao processar a requisição. Tente novamente."); 
           });
        }
        return res.json(); 
    })
    .then(data => {
      if (data.error) {
        // Display API error message inside the resultDiv
        resultDiv.innerHTML = `<div class="bin-lookup-error-message"><i class="fas fa-exclamation-triangle"></i> ${data.error}</div>`;
        resultDiv.style.display = 'block'; 
      } else {
        // Restore the success HTML structure
        resultDiv.innerHTML = successResultHTML; 
        
        // Populate the results
        resultDiv.querySelector('.bin-number').textContent   = data.BIN || 'N/A';
        resultDiv.querySelector('.vendor-name').textContent  = data.Vendor || 'N/A';
        resultDiv.querySelector('.bank-name').textContent    = data.Bank || 'N/A';
        resultDiv.querySelector('.bin-type').textContent     = data.Type || 'N/A';
        resultDiv.querySelector('.card-level').textContent   = data.Level || 'N/A';
        resultDiv.querySelector('.country-name').textContent = data.Country ? `${data.Country} (${data.CountryCode || 'N/A'})` : 'N/A';
        
        resultDiv.style.display = 'block'; // Show populated results
      }
    })
    .catch((error) => {
      console.error('BIN Lookup Fetch Error:', error); 
      // Display the Portuguese error message inside the resultDiv
      resultDiv.innerHTML = `<div class="bin-lookup-error-message"><i class="fas fa-exclamation-triangle"></i> ${error.message}</div>`; // Display the error message from the throw
      resultDiv.style.display = 'block'; 
    })
    .finally(() => {
        // Restore button and reset reCAPTCHA
        submitButton.disabled = false; 
        submitButton.innerHTML = originalButtonHTML; 
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
        }
    });
  });
});