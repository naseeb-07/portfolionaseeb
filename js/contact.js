const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");

// Initialize EmailJS
// IMPORTANT: Replace 'YOUR_PUBLIC_KEY' with your actual EmailJS Public Key
// Sign up at https://www.emailjs.com/
emailjs.init("hZU0il1oSeipFfQ3u");

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = form.querySelector('button');
  const originalBtnText = submitBtn.innerText;

  // Show Loading State
  submitBtn.innerText = 'Sending...';
  submitBtn.disabled = true;
  status.innerText = '';

  // Get Form Data
  const params = {
    from_name: form.name.value,
    from_email: form.email.value,
    message: form.message.value
  };

  // Send Email
  // IMPORTANT: Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual EmailJS IDs
  try {
    await emailjs.send("service_fd8q6f7", "template_xkoz4ea", params);

    // Success Handling
    status.className = 'text-center font-medium mt-4 text-green-400';
    status.innerText = 'Message sent successfully! I will get back to you soon.';
    form.reset();
  } catch (error) {
    // Error Handling
    console.error('EmailJS Error:', error);
    status.className = 'text-center font-medium mt-4 text-red-400';
    status.innerText = `Failed: ${error.text || error.message || 'Check console for details'}`;
  } finally {
    // Reset Button
    submitBtn.innerText = originalBtnText;
    submitBtn.disabled = false;
  }
});
