// Payment confirmation functionality

document.addEventListener("DOMContentLoaded", () => {
  loadBookingData();
  animateElements();
});

function getBookingData() {
  return JSON.parse(localStorage.getItem("currentBooking") || "{}");
}

function setBookingData(data) {
  localStorage.setItem("currentBooking", JSON.stringify(data));
}

function loadBookingData() {
  const bookingData = getBookingData();
  console.log("Loaded booking data:", bookingData);

  // Set movie poster dynamically
  const posterElem = document.querySelector(
    ".movie-poster img, img.movie-poster"
  );
  if (posterElem && bookingData.poster_url) {
    posterElem.src = bookingData.poster_url;
  }

  // Update movie details
  if (bookingData.movie) {
    const movieTitleEl = document.querySelector(".movie-title");
    if (movieTitleEl) movieTitleEl.textContent = bookingData.movie;
  }

  // Update seat and pricing information
  if (Array.isArray(bookingData.seats) && bookingData.seats.length > 0) {
    const seatCount = bookingData.seats.length;
    const seatList = bookingData.seats.join(", ");

    const ticketRowSpan = document.querySelector(
      ".ticket-row span:first-child"
    );
    if (ticketRowSpan)
      ticketRowSpan.textContent = `${seatCount} Ticket${
        seatCount > 1 ? "s" : ""
      }`;

    const seatInfoEl = document.querySelector(".seat-info");
    if (seatInfoEl)
      seatInfoEl.textContent = `Selected Seat${
        seatCount > 1 ? "s" : ""
      } - ${seatList}`;

    const pricePerSeat = 100;
    const bookingChargePerSeat = 30;
    const bookingCharge = bookingChargePerSeat * seatCount;
    const totalTicketPrice = pricePerSeat * seatCount;
    const totalAmount = totalTicketPrice + bookingCharge;

    const orderAmountSummary = document.getElementById("order-amount-summary");
    if (orderAmountSummary)
      orderAmountSummary.textContent = `₹${pricePerSeat} x ${seatCount} = ₹${totalTicketPrice}.00`;

    const bookingChargeSummary = document.getElementById(
      "booking-charge-summary"
    );
    if (bookingChargeSummary)
      bookingChargeSummary.textContent = `₹${bookingChargePerSeat} x ${seatCount} = ₹${bookingCharge}.00`;

    const totalAmountSummary = document.getElementById("total-amount-summary");
    if (totalAmountSummary)
      totalAmountSummary.textContent = `₹${totalAmount}.00`;

    const priceEl = document.querySelector(".price");
    if (priceEl) priceEl.textContent = `₹${totalTicketPrice}`;

    const amountEl = document.querySelector(".amount");
    if (amountEl) amountEl.textContent = `₹${totalAmount}.00`;

    // Save updated pricing info
    const updatedBookingData = {
      ...bookingData,
      pricing: {
        pricePerSeat,
        ticketPrice: totalTicketPrice,
        bookingCharge,
        total: totalAmount,
        seatCount,
      },
    };
    setBookingData(updatedBookingData);
  }

  // Update payment method
  if (bookingData.paymentMethod) {
    const paymentMethodEl = document.querySelector(".payment-method-name");
    if (paymentMethodEl)
      paymentMethodEl.textContent = bookingData.paymentMethod;
  }
}

function animateElements() {
  const elements = document.querySelectorAll(
    ".movie-section, .booking-details, .payment-summary"
  );
  elements.forEach((element, index) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";
    setTimeout(() => {
      element.style.transition = "all 0.5s ease";
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }, index * 100);
  });

  const paymentBar = document.querySelector(".payment-method-bar");
  if (paymentBar) {
    paymentBar.style.transform = "translateX(-50%) translateY(100%)";
    setTimeout(() => {
      paymentBar.style.transition = "transform 0.5s ease";
      paymentBar.style.transform = "translateX(-50%) translateY(0)";
    }, 500);
  }
}

async function processPayment() {
  showProcessingOverlay();

  const bookingData = getBookingData();

  try {
    if (
      !bookingData.userId ||
      !bookingData.showtimeId ||
      !Array.isArray(bookingData.seats) ||
      bookingData.seats.length === 0
    ) {
      throw new Error("Missing user, showtime, or seats");
    }

    // Step 1: Create booking
    const createRes = await fetch("/api/bookings/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: bookingData.userId,
        showtimeId: bookingData.showtimeId,
        seats: bookingData.seats,
      }),
    });

    const createData = await createRes.json();

    if (!createRes.ok || !createData.success) {
      throw new Error(createData.message || "Booking creation failed");
    }

    bookingData.bookingIds = createData.bookingIds;
    bookingData.bookingId = createData.bookingIds[0];
    setBookingData(bookingData);

    // Step 2: Confirm payment
    const confirmRes = await fetch("/api/bookings/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingIds: bookingData.bookingIds,
        paymentStatus: "confirmed",
        amount: bookingData.pricing?.total || 0,
        transactionId:
          bookingData.transactionId || `TXN-${Date.now()}`,
      }),
    });

    const confirmData = await confirmRes.json();

    if (!confirmRes.ok || !confirmData.success) {
      throw new Error(confirmData.message || "Payment confirmation failed");
    }

    bookingData.status = "confirmed";
    setBookingData(bookingData);

    alert("Payment processed successfully!");

    window.location.href =
      `booking_successful.html?id=${bookingData.bookingId}`;
  } catch (error) {
    console.error("Payment error:", error);
    alert(error.message || "Server error while processing booking/payment.");
  } finally {
    hideProcessingOverlay();
  }
}

function showProcessingOverlay() {
  let overlay = document.querySelector(".processing-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "processing-overlay";
    overlay.innerHTML = `
      <div class="processing-content">
        <div class="processing-spinner"></div>
        <h3>Processing Payment</h3>
        <p>Please wait while we process your payment...</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  setTimeout(() => {
    overlay.classList.add("active");
  }, 100);
}

function hideProcessingOverlay() {
  const overlay = document.querySelector(".processing-overlay");
  if (overlay) {
    overlay.classList.remove("active");
  }
}

function goBack() {
  window.history.back();
}

// Reload booking data if page becomes visible again
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    loadBookingData();
  }
});
