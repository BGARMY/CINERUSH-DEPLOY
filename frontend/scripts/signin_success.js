document.addEventListener("DOMContentLoaded", () => {
  // Simulate the sign-in success flow
  console.log("[v0] Sign-in success page loaded");

  // Add entrance animation
  const content = document.querySelector(".content");
  if (content) {
    content.style.opacity = "0";
    content.style.transform = "translateY(20px)";

    setTimeout(() => {
      content.style.transition = "all 0.6s ease";
      content.style.opacity = "1";
      content.style.transform = "translateY(0)";
    }, 100);
  }

  // Simulate redirect after 3 seconds
  setTimeout(() => {
    console.log("[v0] Redirecting to homepage...");
    // In a real app, this would redirect to the homepage
    // window.location.href = 'homepage.html';

    // For demo purposes, show completion message
    const successTitle = document.querySelector(".success-title");
    const waitText = document.querySelector(".wait-text");
    const redirectText = document.querySelector(".redirect-text");

    if (successTitle) successTitle.textContent = "Redirecting...";
    if (waitText) waitText.style.display = "none";
    if (redirectText) redirectText.textContent = "Taking you to the homepage now!";
  }, 3000);

  // Add loading animation completion after 5 seconds
  setTimeout(() => {
    const loadingContainer = document.querySelector(".loading-container");
    if (loadingContainer) {
      loadingContainer.style.transition = "all 0.5s ease";
      loadingContainer.style.opacity = "0";
      loadingContainer.style.transform = "translate(-50%, -50%) scale(0.8)";
    }

    // Show final success state
    const successMessage = document.querySelector(".success-message");
    if (successMessage) {
      successMessage.innerHTML = `
        <h2 class="success-title" style="color: #22c55e;">Welcome to CINE RUSH!</h2>
        <p class="redirect-text">Ready to explore movies and book tickets.</p>
      `;
    }
  }, 5000);

  // Add some interactive feedback for disabled elements
  document.querySelectorAll(".input-field, .eye-icon, .signin-button").forEach((element) => {
    element.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("[v0] Element is disabled during sign-in process");
    });
  });
});