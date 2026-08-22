// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  initializePage();
  addLoadingAnimations();
});

// Initialize page functionality
function initializePage() {
  console.log("Now Playing page initialized");

  // Add loading class to movie cards for animation
  const movieCards = document.querySelectorAll(".movie-card");
  movieCards.forEach((card) => {
    card.classList.add("loading");
  });
}

// Add loading animations
function addLoadingAnimations() {
  const movieCards = document.querySelectorAll(".movie-card");

  movieCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.animation = `fadeInUp 0.6s ease ${index * 0.1}s forwards`;
    }, 100);
  });
}

function bookMovie(movieTitle) {
  window.location.href = `../pages/movie_booking.html?movie=${encodeURIComponent(movieTitle)}`;
}

function goBack() {
  window.history.back();
}

// Show booking confirmation
function showBookingConfirmation(movieTitle) {
  // Create and show a simple confirmation
  const confirmation = document.createElement("div");
  confirmation.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        text-align: center;
        max-width: 300px;
        width: 90%;
    `;

  confirmation.innerHTML = `
        <h3 style="margin-bottom: 10px; color: #333;">Booking ${movieTitle}</h3>
        <p style="color: #666; margin-bottom: 15px;">Redirecting to booking page...</p>
        <div style="width: 30px; height: 30px; border: 3px solid #ff4444; border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
    `;

  // Add spinner animation
  const style = document.createElement("style");
  style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
  document.head.appendChild(style);

  // Add backdrop
  const backdrop = document.createElement("div");
  backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
    `;

  document.body.appendChild(backdrop);
  document.body.appendChild(confirmation);

  // Remove after 2 seconds
  setTimeout(() => {
    document.body.removeChild(backdrop);
    document.body.removeChild(confirmation);
    document.head.removeChild(style);
  }, 2000);
}

// Add touch feedback for mobile
document.addEventListener("touchstart", (e) => {
  if (e.target.classList.contains("movie-card")) {
    e.target.style.transform = "scale(0.98)";
  }
});

document.addEventListener("touchend", (e) => {
  if (e.target.classList.contains("movie-card")) {
    setTimeout(() => {
      e.target.style.transform = "scale(1)";
    }, 100);
  }
});

// Handle page visibility for animations
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    // Re-trigger animations when page becomes visible
    addLoadingAnimations();
  }
});