// public/js/script.js

// Auto-dismiss flash alerts after a few seconds
document.addEventListener("DOMContentLoaded", () => {
  const alerts = document.querySelectorAll(".alert");
  alerts.forEach((alertEl) => {
    setTimeout(() => {
      alertEl.classList.remove("show");
      alertEl.classList.add("fade");
      setTimeout(() => alertEl.remove(), 500);
    }, 4000);
  });

  // Simple client-side check: expiry date must be after prepared date
  const preparedInput = document.querySelector('input[name="preparedAt"]');
  const expiryInput = document.querySelector('input[name="expiryAt"]');
  const form = document.querySelector("form");

  if (preparedInput && expiryInput && form) {
    form.addEventListener("submit", (e) => {
      const prepared = new Date(preparedInput.value);
      const expiry = new Date(expiryInput.value);

      if (expiry <= prepared) {
        e.preventDefault();
        alert("Expiry time must be after the prepared time.");
      }
    });
  }
});
