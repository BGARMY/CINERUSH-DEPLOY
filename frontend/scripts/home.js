// Promotional Banner JavaScript
class PromotionalBanner {
  constructor() {
    this.currentSlide = 0
    this.slides = document.querySelectorAll(".banner-slide")
    this.dots = document.querySelectorAll(".dot")
    this.prevBtn = document.querySelector(".banner-arrow.prev")
    this.nextBtn = document.querySelector(".banner-arrow.next")
    this.autoRotateInterval = null
    this.isUserInteracting = false

    console.log("[v0] Banner initialized with", this.slides.length, "slides")
    this.init()
  }

  init() {
    if (!this.slides.length || !this.dots.length || !this.prevBtn || !this.nextBtn) {
      console.error("[v0] Banner elements not found")
      return
    }

    // Add event listeners
    this.prevBtn.addEventListener("click", () => this.prevSlide())
    this.nextBtn.addEventListener("click", () => this.nextSlide())

    // Add dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => this.goToSlide(index))
    })

    // Start auto-rotation
    this.startAutoRotate()

    // Pause on hover
    const banner = document.querySelector(".promotional-banner")
    if (banner) {
      banner.addEventListener("mouseenter", () => this.pauseAutoRotate())
      banner.addEventListener("mouseleave", () => this.resumeAutoRotate())
    }

    console.log("[v0] Banner event listeners added")
  }

  showSlide(index) {
    console.log("[v0] Showing slide", index)

    // Hide all slides
    this.slides.forEach((slide) => slide.classList.remove("active"))
    this.dots.forEach((dot) => dot.classList.remove("active"))

    // Show current slide
    this.slides[index].classList.add("active")
    this.dots[index].classList.add("active")

    this.currentSlide = index
  }

  nextSlide() {
    this.isUserInteracting = true
    const nextIndex = (this.currentSlide + 1) % this.slides.length
    this.showSlide(nextIndex)
    setTimeout(() => (this.isUserInteracting = false), 1000)
  }

  prevSlide() {
    this.isUserInteracting = true
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length
    this.showSlide(prevIndex)
    setTimeout(() => (this.isUserInteracting = false), 1000)
  }

  goToSlide(index) {
    this.isUserInteracting = true
    this.showSlide(index)
    setTimeout(() => (this.isUserInteracting = false), 1000)
  }

  startAutoRotate() {
    console.log("[v0] Starting auto-rotation")
    this.autoRotateInterval = setInterval(() => {
      if (!this.isUserInteracting) {
        this.nextSlide()
      }
    }, 5000) // Change slide every 5 seconds
  }

  pauseAutoRotate() {
    console.log("[v0] Pausing auto-rotation")
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval)
      this.autoRotateInterval = null
    }
  }

  resumeAutoRotate() {
    console.log("[v0] Resuming auto-rotation")
    if (!this.autoRotateInterval) {
      this.startAutoRotate()
    }
  }
}

// Initialize the banner when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOM loaded, initializing banner")
  new PromotionalBanner()
})


document.addEventListener("DOMContentLoaded", () => {
  // Navigation functionality
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      navItems.forEach((nav) => nav.classList.remove("active"));
      this.classList.add("active");
    });
  });

  function bookMovie(movieTitle) {
    window.location.href = `booking.html?movie=${encodeURIComponent(movieTitle)}`;
  }

  // Fetch Now Playing Movies
  fetch("/api/movies/now-playing")
    .then(res => res.json())
    .then(data => {
      console.log("Now Playing Movies:", data);
    });

  // Fetch Coming Soon Movies
  fetch("/api/movies/coming-soon")
    .then(res => res.json())
    .then(data => {
      console.log("Coming Soon Movies:", data);
    });

  // Book Now button functionality
  const bookButtons = document.querySelectorAll(".book-btn:not(.disabled)");

  bookButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const movieTitle = this.parentElement.querySelector(".movie-title").textContent;

      // Add loading state
      const originalText = this.textContent;
      this.textContent = "Booking...";
      this.disabled = true;

      // Simulate booking process
      setTimeout(() => {
        alert(`Booking ${movieTitle}...`);
        this.textContent = originalText;
        this.disabled = false;
        window.location.href = `movie_booking.html?movie=${encodeURIComponent(movieTitle)}`;
      }, 1000);
    });
  });
  
  // View All button functionality
  const viewAllButtons = document.querySelectorAll(".view-all-btn");

  viewAllButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const section = this.dataset.section;
      const sectionTitle = this.parentElement.querySelector("h2").textContent;

      alert(`Viewing all ${sectionTitle.toLowerCase()} movies...`);

      if (section === "now_playing") {
        window.location.href = "now_playing.html";
      } else if (section === "coming_soon") {
        window.location.href = "coming_soon.html";
      } else {
        alert("Unknown section!");
      }
    });
  });

  // Notification button functionality
  const notificationBtn = document.querySelector(".notification-btn");
  if (notificationBtn) {
    notificationBtn.addEventListener("click", function () {
      this.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.style.transform = "scale(1)";
        alert("No new notifications");
      }, 150);
    });
  }

  // Location click functionality
  const locationArea = document.querySelector(".location");
  if (locationArea) {
    locationArea.addEventListener("click", () => {
      alert("Change location feature coming soon!");
    });
  }

  // Smooth scroll for movie grids
  const movieGrids = document.querySelectorAll(".movies-grid");

  movieGrids.forEach((grid) => {
    let isScrolling = false;

    grid.addEventListener("scroll", () => {
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          // Add any scroll-based animations here
          isScrolling = false;
        });
        isScrolling = true;
      }
    });
  });

  // Add touch feedback for mobile
  const interactiveElements = document.querySelectorAll("button, .location");

  interactiveElements.forEach((element) => {
    element.addEventListener("touchstart", function () {
      this.style.opacity = "0.7";
    });

    element.addEventListener("touchend", function () {
      this.style.opacity = "1";
    });

    element.addEventListener("touchcancel", function () {
      this.style.opacity = "1";
    });
  });

  // Initialize page
  console.log("CINE RUSH Homepage loaded successfully");

  // Add entrance animation
  const container = document.querySelector(".container");
  if (container) {
    container.style.opacity = "0";
    container.style.transform = "translateY(20px)";

    setTimeout(() => {
      container.style.transition = "all 0.6s ease-out";
      container.style.opacity = "1";
      container.style.transform = "translateY(0)";
    }, 100);
  }

  // Bottom navigation logic
  const navButtons = document.querySelectorAll('.bottom-nav button');
  navButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      switch (idx) {
        case 0:
          window.location.href = 'home.html';
          break;
        case 1:
          window.location.href = 'my_ticket.html';
          break;
        case 2:
          window.location.href = 'profile.html';
          break;
      }
    });
  });
});