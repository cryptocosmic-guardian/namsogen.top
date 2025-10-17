function onSubmit(token) {
  document.querySelector('textarea[name="g-recaptcha-response"]').value = token;
  document.getElementById('bin-lookup-form').dispatchEvent(new Event('submit'));
}

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('bin-lookup-form');
  const resultDiv = document.getElementById('bin-lookup-result');
  const recaptchaWidget = document.querySelector('.g-recaptcha');

  // Adiciona elemento de loading
  let loadingDiv = document.getElementById('bin-lookup-loading');
  if (!loadingDiv) {
    loadingDiv = document.createElement('div');
    loadingDiv.id = 'bin-lookup-loading';
    loadingDiv.style.display = 'none';
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.margin = '16px 0';
    loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    form.parentNode.insertBefore(loadingDiv, form.nextSibling);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    loadingDiv.style.display = 'block';
    resultDiv.style.display = 'none';
    // Se reCAPTCHA está presente, resetar após submit
    if (typeof grecaptcha !== 'undefined') {
      setTimeout(function() { grecaptcha.reset(); }, 500);
    }
    const binValue = form.querySelector('input[name="bin"]').value;
    const recaptchaToken = document.querySelector('textarea[name="g-recaptcha-response"]').value;
    const payload = new URLSearchParams({
      bin: binValue,
      'g-recaptcha-response': recaptchaToken
    });
    fetch('https://lind.uno/bins.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      body: payload.toString()
    })
    .then(res => res.json())
    .then(data => {
      loadingDiv.style.display = 'none';
      resultDiv.style.display = 'block';
      if (data.error) {
        resultDiv.innerHTML = `
          <div style="color:red;text-align:center;padding:20px;">
            <i class="fas fa-exclamation-circle"></i> ${data.error}
          </div>`;
        return;
      }
      document.querySelector('.bin-number').textContent   = `BIN: ${data.BIN}`;
      document.querySelector('.vendor-name').textContent  = data.Vendor;
      document.querySelector('.bank-name').textContent    = data.Bank;
      document.querySelector('.bin-type').textContent     = data.Type;
      document.querySelector('.card-level').textContent   = data.Level;
      document.querySelector('.country-name').textContent = `${data.Country} (${data.CountryCode})`;
      document.querySelector('.phone-number').textContent = data.Phone;
      const websiteSpan = document.querySelector('.website-url');
      if (data.Website && data.Website !== 'No information') {
        websiteSpan.innerHTML = `<a href="//${data.Website}" target="_blank">${data.Website}</a>`;
      } else {
        websiteSpan.textContent = data.Website;
      }
    })
    .catch(() => {
      loadingDiv.style.display = 'none';
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `
        <div style="color:red;text-align:center;padding:20px;">
          <i class="fas fa-exclamation-circle"></i>
          Erro ao processar a requisição. Tente novamente.
        </div>`;
    });
  });
});
