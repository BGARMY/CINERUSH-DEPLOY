document.addEventListener("DOMContentLoaded", () => {
  // Password visibility toggle functionality
  const toggleButtons = document.querySelectorAll(".toggle-password");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const passwordInput = document.getElementById(targetId);
      const eyeIcon = this.querySelector(".eye-icon");

      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        // Change to eye-off icon
        eyeIcon.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        `;
      } else {
        passwordInput.type = "password";
        // Change back to eye icon
        eyeIcon.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        `;
      }
    });
  });

  // Form submission handling
  const form = document.getElementById("signinForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // Basic validation
      if (!email || !password) {
        alert("Please fill in all fields");
        return;
      }

      if (!isValidEmail(email)) {
        alert("Please enter a valid email address");
        return;
      }

      const submitBtn = document.querySelector(".submit-btn");
      const originalText = submitBtn.textContent;

      submitBtn.textContent = "Signing in...";
      submitBtn.disabled = true;

      // Real API call to backend
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (response.ok) {
          // Store userId in localStorage
          if (data.user && data.user.id) {
            localStorage.setItem("userId", data.user.id);
          }
          alert("Sign in successful! Redirecting to dashboard...");
          window.location.href = "home.html";
        } else {
          alert(data.message || "Sign in failed");
        }
      } catch (err) {
        alert("Network error. Please try again.");
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Email validation function
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Add smooth focus effects
  const inputs = document.querySelectorAll(".input-field");

  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.style.transform = "scale(1.02)";
      this.parentElement.style.transition = "transform 0.2s ease";
    });

    input.addEventListener("blur", function () {
      this.parentElement.style.transform = "scale(1)";
    });
  });
});
