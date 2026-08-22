// Optional: Add any interactive functionality here
document.addEventListener("DOMContentLoaded", () => {
  console.log("CINE RUSH app loaded");

  // Add click interaction to logo if it exists
  const logoContainer = document.querySelector(".logo-container");
  if (logoContainer) {
    logoContainer.addEventListener("click", () => {
      console.log("Logo clicked!");
      // Redirect to signup page
      window.location.href = "signup.html";
    });
  }
});