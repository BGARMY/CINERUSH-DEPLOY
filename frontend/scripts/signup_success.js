// Success screen functionality
document.addEventListener("DOMContentLoaded", () => {
  // Add entrance animation
  const container = document.querySelector(".container");
  if (container) {
    container.style.opacity = "0";
    container.style.transform = "translateY(20px)";

    setTimeout(() => {
      container.style.transition = "all 0.6s ease";
      container.style.opacity = "1";
      container.style.transform = "translateY(0)";
    }, 100);
  }

  // Animate success icon
  const successIcon = document.querySelector(".success-icon");
  if (successIcon) {
    setTimeout(() => {
      successIcon.style.transform = "scale(1.1)";
      successIcon.style.transition = "transform 0.3s ease";

      setTimeout(() => {
        successIcon.style.transform = "scale(1)";
      }, 300);
    }, 800);
  }

  // Add button interaction feedback
  const ctaButton = document.querySelector(".cta-button");
  if (ctaButton) {
    ctaButton.addEventListener("touchstart", function () {
      this.style.transform = "scale(0.98)";
    });

    ctaButton.addEventListener("touchend", function () {
      this.style.transform = "scale(1)";
    });
  }
});

// Handle start watching button click
function startWatching() {
  const button = document.querySelector(".cta-button");
  if (button) {
    // Add loading state
    button.style.transform = "scale(0.98)";
    button.textContent = "Loading...";

    // Simulate navigation delay
    setTimeout(() => {
      // In a real app, this would navigate to the main app
      window.location.href = "home.html"; // change this to your actual page
    }, 1000);
  }
}