// Seat selection functionality

document.addEventListener("DOMContentLoaded", () => {
  setDefaultOccupiedSeats();
  loadBookedSeats();
  initializeSeatSelection();
  initializeAnimations();
  loadBookingDetails();
  setTimeout(() => {
    autoSelectSeat("D4");
  }, 500);
  setTimeout(suggestBestSeats, 2000);
});

let selectedSeats = [];

// Mark default occupied seats
function setDefaultOccupiedSeats() {
  const defaultOccupiedSeats = [
    "A1", "A2", "A11", "A12", "B3", "B10", "C7", "C8", "E2", "E11",
    "F5", "F6", "F7", "G1", "G12", "H4", "H9", "I6", "I7", "J3", "J10"
  ];
  defaultOccupiedSeats.forEach(markSeatOccupied);
}

function markSeatOccupied(seatId) {
  const seatElement = document.querySelector(`[data-seat="${seatId}"]`);
  if (seatElement && seatElement.classList.contains("available")) {
    seatElement.classList.remove("available");
    seatElement.classList.add("occupied");
    seatElement.style.pointerEvents = "none";
    seatElement.style.cursor = "not-allowed";
  }
}

// Load seats already booked for this showtime
async function loadBookedSeats() {
  const bookingInfo = getBookingInfo();
  const showtimeId = bookingInfo.showtimeId || localStorage.getItem("showtimeId");
  if (!showtimeId) return;

  try {
    const response = await fetch(`/api/bookings/booked-seats?showtimeId=${showtimeId}`);
    const data = await response.json();
    if (data && Array.isArray(data.bookedSeats)) {
      data.bookedSeats.forEach(markSeatOccupied);
    }
  } catch (err) {
    console.error("Failed to load booked seats from DB", err);
  }
}

// Initialize seat selection click handlers
function initializeSeatSelection() {
  const seats = document.querySelectorAll(".seat.available");
  seats.forEach((seat) => {
    seat.addEventListener("click", () => handleSeatClick(seat));
  });
}

function handleSeatClick(seat) {
  const seatId = seat.dataset.seat;
  if (seat.classList.contains("selected")) {
    seat.classList.remove("selected");
    selectedSeats = selectedSeats.filter((id) => id !== seatId);
  } else {
    if (selectedSeats.length < 5) {
      seat.classList.add("selected");
      selectedSeats.push(seatId);
    } else {
      alert("You can select maximum 5 seats");
      return;
    }
  }
  updateSeatCount();
  updateProceedButton();
  seat.style.transform = "scale(0.9)";
  setTimeout(() => {
    seat.style.transform = seat.classList.contains("selected") ? "scale(1.05)" : "scale(1)";
  }, 150);
}

// Update seat count display
function updateSeatCount() {
  const seatCountDisplay = document.getElementById("seatCountText");
  if (seatCountDisplay) {
    const seatCount = selectedSeats.length;
    seatCountDisplay.textContent = seatCount === 1 ? "1 Seat Selected" : `${seatCount} Seats Selected`;
  }
}

// Enable/disable proceed button
function updateProceedButton() {
  const proceedBtn = document.getElementById("proceedBtn");
  if (selectedSeats.length > 0) {
    proceedBtn.disabled = false;
    proceedBtn.onclick = proceedToPayment;
  } else {
    proceedBtn.disabled = true;
    proceedBtn.onclick = null;
  }
}

// Save booking info and navigate to payment
function proceedToPayment() {
  const bookingInfo = getBookingInfo();
  const userId = bookingInfo.userId || localStorage.getItem("userId");
  const showtimeId = bookingInfo.showtimeId || localStorage.getItem("showtimeId");

  if (!userId || !showtimeId || selectedSeats.length === 0) {
    alert("Please log in, select a showtime, and choose at least one seat.");
    return;
  }

  const bookingPayload = {
    userId,
    showtimeId,
    seats: selectedSeats,
    movie: bookingInfo.movie,
    poster_url: bookingInfo.poster_url,
    date: bookingInfo.date,
    time: bookingInfo.time,
    cinema: bookingInfo.cinema,
    location: bookingInfo.location,
  };

  localStorage.setItem("currentBooking", JSON.stringify(bookingPayload));

  const seatList = selectedSeats.join(", ");
  const confirmMessage = `Confirm booking for:\n\nMovie: ${bookingInfo.movie}\nDate: ${bookingInfo.date}\nTime: ${bookingInfo.time}\nSeats: ${seatList}\n\nProceed to payment?`;

  if (!confirm(confirmMessage)) return;

  const proceedBtn = document.getElementById("proceedBtn");
  proceedBtn.textContent = "Processing...";
  proceedBtn.disabled = true;

  setTimeout(() => {
    window.location.href = "payment_selection.html";
  }, 500);
}

// Utility: get booking info from localStorage
function getBookingInfo() {
  return JSON.parse(localStorage.getItem("currentBooking") || "{}");
}

// Optionally display booking details
function loadBookingDetails() {
  const bookingDetails = getBookingInfo();
  if (bookingDetails.movie) {
    // Display booking details if needed
    // console.log("[v0] Loaded booking details:", bookingDetails);
  }
}

// Back button functionality
function goBack() {
  const container = document.querySelector(".container");
  if (container) {
    container.style.transform = "translateX(-100%)";
    container.style.opacity = "0";
    setTimeout(() => {
      window.history.back();
    }, 300);
  } else {
    window.history.back();
  }
}

// Entrance animations
function initializeAnimations() {
  const elements = document.querySelectorAll(".container > *");
  elements.forEach((element, index) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";
    setTimeout(() => {
      element.style.transition = "all 0.6s ease";
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }, index * 100);
  });
}

// Auto-select a seat if available
function autoSelectSeat(seatId) {
  const seat = document.querySelector(`[data-seat="${seatId}"]`);
  if (seat && seat.classList.contains("available")) {
    seat.click();
  }
}

// Suggest best seats (middle rows, center seats)
function suggestBestSeats() {
  const bestSeats = ["D5", "D6", "E5", "E6"];
  const availableBestSeats = bestSeats.filter((seatId) => {
    const seat = document.querySelector(`[data-seat="${seatId}"]`);
    return seat && seat.classList.contains("available");
  });
  if (availableBestSeats.length >= 2 && selectedSeats.length === 0) {
    setTimeout(() => {
      if (confirm("Would you like us to select the best available seats for you?")) {
        availableBestSeats.slice(0, 2).forEach((seatId) => {
          const seat = document.querySelector(`[data-seat="${seatId}"]`);
          seat.click();
        });
      }
    }, 1000);
  }
}

// Touch feedback for mobile devices
document.addEventListener("touchstart", () => {}, { passive: true });

// Expose goBack globally for HTML onclick
window.goBack = goBack;