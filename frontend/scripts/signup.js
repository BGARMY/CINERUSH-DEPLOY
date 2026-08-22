document.addEventListener("DOMContentLoaded", () => {
  console.log("CINE RUSH signup form loaded");

  // Password visibility toggle functionality
  const toggleButtons = document.querySelectorAll(".toggle-password");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");
      const passwordInput = document.getElementById(targetId);
      const eyeIcon = button.querySelector(".eye-icon");

      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        // Change eye icon to "eye-off" when password is visible
        eyeIcon.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#9CA3AF" stroke-width="2" fill="none"/>
          <line x1="1" y1="1" x2="23" y2="23" stroke="#9CA3AF" stroke-width="2"/>
        `;
      } else {
        passwordInput.type = "password";
        // Change back to normal eye icon
        eyeIcon.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#9CA3AF" stroke-width="2" fill="none"/>
          <circle cx="12" cy="12" r="3" stroke="#9CA3AF" stroke-width="2" fill="none"/>
        `;
      }
    });
  });

  // Form submission handling
  const signupForm = document.querySelector(".signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Basic validation
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters long!");
        return;
      }

      if (!name || !email) {
        alert("Please fill in all fields!");
        return;
      }

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();

        if (response.ok) {
          // Save userId in localStorage if returned by backend
          if (data.user && data.user.id) {
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("userName", data.user.name); // optional
          }
          alert("Signup successful!");
          window.location.href = "/pages/signup_success.html";
        }
      } catch (err) {
        alert("Network error. Please try again.");
      }
    });
  }

  // Sign in link handling
  const signInLink = document.querySelector(".link");
  if (signInLink) {
    signInLink.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Navigate to sign in page");
      // Add navigation logic here
      window.location.href = "signin.html";
    });
  }
});
