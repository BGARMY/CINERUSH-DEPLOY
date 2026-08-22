// Coming Soon Page JavaScript

// Initialize watchlist from localStorage
let watchList = JSON.parse(localStorage.getItem("cineRushWatchList")) || [];

// Go back function
function goBack() {
  const backBtn = document.querySelector(".back-btn");
  if (backBtn) backBtn.style.transform = "scale(0.95)";

  setTimeout(() => {
    if (backBtn) backBtn.style.transform = "scale(1)";
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "homepage.html";
    }
  }, 150);
}

// Add to watch list function
function addToWatchList(movieTitle, event) {
  const button = event?.target;
  if (!button) return;

  // Check if movie is already in watchlist
  if (watchList.includes(movieTitle)) {
    watchList = watchList.filter((movie) => movie !== movieTitle);
    button.textContent = "Watch List";
    button.classList.remove("added");
    showNotification(`${movieTitle} removed from watchlist`);
  } else {
    watchList.push(movieTitle);
    button.textContent = "Added";
    button.classList.add("added", "pulse");
    showNotification(`${movieTitle} added to watchlist`);
    setTimeout(() => {
      button.classList.remove("pulse");
    }, 300);
  }

  localStorage.setItem("cineRushWatchList", JSON.stringify(watchList));

  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
}

// Show notification function
function showNotification(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 500;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "1";
  }, 100);

  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2000);
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  // Update button states based on existing watchlist
  const buttons = document.querySelectorAll(".watch-list-btn");
  buttons.forEach((button) => {
    const movieCard = button.closest(".movie-card");
    const movieTitle = movieCard.querySelector(".movie-title").textContent;
    if (watchList.includes(movieTitle)) {
      button.textContent = "Added";
      button.classList.add("added");
    }
    // Attach click handler
    button.addEventListener("click", (event) => addToWatchList(movieTitle, event));
  });

  // Add smooth entrance animation
  const movieCards = document.querySelectorAll(".movie-card");
  movieCards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    setTimeout(() => {
      card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 100);
  });
});

// Add touch feedback for mobile devices
document.addEventListener("touchstart", (e) => {
  if (e.target.classList.contains("watch-list-btn") || e.target.classList.contains("back-btn")) {
    e.target.style.transform = "scale(0.95)";
  }
});

document.addEventListener("touchend", (e) => {
  if (e.target.classList.contains("watch-list-btn") || e.target.classList.contains("back-btn")) {
    setTimeout(() => {
      e.target.style.transform = "";
    }, 100);
  }
});