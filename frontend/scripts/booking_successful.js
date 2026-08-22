document.addEventListener("DOMContentLoaded", () => {
  loadBookingData();
  saveTicketData();
  startSuccessAnimations();

  // Clear current booking after successful completion
  setTimeout(() => {
    localStorage.removeItem("currentBooking");
  }, 2000);
});

function loadBookingData() {
  const bookingData = JSON.parse(localStorage.getItem("currentBooking") || "{}");

  const posterElem = document.querySelector(".movie-poster-img");
  if (posterElem && bookingData.poster_url) {
    posterElem.src = bookingData.poster_url;
  }

  if (bookingData.movie) {
    document.querySelector(".movie-title").textContent = bookingData.movie;
  }
  if (bookingData.paymentMethod) {
    document.querySelector(".payment-method-name").textContent = bookingData.paymentMethod;
  }
  if (bookingData.pricing) {
    const summaryRows = document.querySelectorAll(".payment-summary-bg .summary-row");
    if (summaryRows.length >= 3) {
      summaryRows[0].querySelector("span:last-child").textContent = `₹${bookingData.pricing.ticketPrice}.00`;
      summaryRows[2].querySelector("span:last-child").textContent = `₹${bookingData.pricing.total}.00`;
    }
    document.querySelector(".amount").textContent = `₹${bookingData.pricing.total}.00`;
  }
}

// Convert JS Date → MySQL DATETIME (YYYY-MM-DD HH:MM:SS)
function formatForMySQL(dateObj) {
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")} ${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}:${String(dateObj.getSeconds()).padStart(2, "0")}`;
}

function saveTicketData() {
  const bookingData = JSON.parse(localStorage.getItem("currentBooking") || "{}");
  if (!bookingData.movie || !bookingData.seats?.length) {
    console.error("❌ Booking data is incomplete:", bookingData);
    return;
  }

  const now = new Date();

  const ticket = {
    id: generateTicketId(),
    movie: bookingData.movie,
    language: bookingData.language || "Telugu 2D",
    cinema: bookingData.cinema || "Sri Padma Veereswara Complex",
    date: bookingData.date || now.toLocaleDateString("en-IN"),
    time: bookingData.time || now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    seats: bookingData.seats,
    pricing: bookingData.pricing,
    paymentMethod: bookingData.paymentMethod || "UPI",
    bookingDate: formatForMySQL(now), // ✅ safe format
    status: "confirmed",
  };

  // Save tickets list
  const existingTickets = JSON.parse(localStorage.getItem("userTickets") || "[]");
  existingTickets.push(ticket);
  localStorage.setItem("userTickets", JSON.stringify(existingTickets));

  // Save booked seats (no duplicates)
  const bookedSeats = new Set(JSON.parse(localStorage.getItem("bookedSeats") || "[]"));
  ticket.seats.forEach(seat => bookedSeats.add(seat));
  localStorage.setItem("bookedSeats", JSON.stringify([...bookedSeats]));

  // Save current ticket
  localStorage.setItem("currentTicket", JSON.stringify(ticket));

  console.log("✅ Ticket saved:", ticket);
}

function generateTicketId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `CR${timestamp}${random}`.slice(-10);
}

function startSuccessAnimations() {
  const successSection = document.querySelector(".success-section");
  successSection.style.opacity = "0";
  successSection.style.transform = "translateY(50px)";

  setTimeout(() => {
    successSection.style.transition = "all 0.8s ease";
    successSection.style.opacity = "1";
    successSection.style.transform = "translateY(0)";
  }, 500);

  setTimeout(() => {
    createConfetti();
  }, 1500);
}

function createConfetti() {
  const colors = ["#ff4444", "#ff6b6b", "#ffa500", "#ffff00", "#00ff00", "#0080ff"];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.style.position = "fixed";
      confetti.style.width = "10px";
      confetti.style.height = "10px";
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * window.innerWidth + "px";
      confetti.style.top = "-10px";
      confetti.style.zIndex = "1000";
      confetti.style.borderRadius = "50%";
      confetti.style.pointerEvents = "none";

      document.body.appendChild(confetti);

      const fallDuration = Math.random() * 3000 + 2000;
      const horizontalMovement = (Math.random() - 0.5) * 200;

      confetti.animate(
        [
          { transform: "translateY(0px) translateX(0px) rotate(0deg)", opacity: 1 },
          { transform: `translateY(${window.innerHeight + 100}px) translateX(${horizontalMovement}px) rotate(720deg)`, opacity: 0 },
        ],
        {
          duration: fallDuration,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }
      ).onfinish = () => confetti.remove();
    }, i * 100);
  }
}

function viewTicket() {
  const button = document.querySelector(".view-ticket-btn");
  button.style.transform = "scale(0.95)";
  setTimeout(() => {
    button.style.transform = "scale(1)";
    window.location.href = "ticket.html";
  }, 150);
}

function goHome() {
  const button = document.querySelector(".back-home-btn");
  button.style.transform = "scale(0.95)";
  setTimeout(() => {
    button.style.transform = "scale(1)";
    window.location.href = "home.html";
  }, 150);
}

function goBack() {
  goHome();
}

window.addEventListener("beforeunload", (e) => {
  const currentTicket = localStorage.getItem("currentTicket");
  if (!currentTicket) {
    e.preventDefault();
    e.returnValue = "";
  }
});

function playSuccessSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
  oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

document.addEventListener("click", () => {
  playSuccessSound();
}, { once: true });
