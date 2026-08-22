// Payment selection functionality
document.addEventListener("DOMContentLoaded", () => {
  // Add entrance animations
  animateElements();

  // Load any previously selected payment method
  loadSelectedPaymentMethod();

  // Add click event listeners to payment options
  const paymentOptions = document.querySelectorAll(".payment-option");
  paymentOptions.forEach((option) => {
    option.addEventListener("click", function () {
      const paymentName = this.querySelector(".payment-name").textContent;
      selectPaymentMethod(paymentName, this);
    });
  });
});

function animateElements() {
  const paymentOptions = document.querySelectorAll(".payment-option");
  paymentOptions.forEach((option, index) => {
    option.style.opacity = "0";
    option.style.transform = "translateX(-20px)";

    setTimeout(() => {
      option.style.transition = "all 0.4s ease";
      option.style.opacity = "1";
      option.style.transform = "translateX(0)";
    }, index * 100);
  });
}

function selectPaymentMethod(paymentMethod, selectedOption = null) {
  // If not passed, try to get from event (for keyboard support)
  if (!selectedOption && event && event.currentTarget) {
    selectedOption = event.currentTarget;
  }
  if (!selectedOption) return;

  selectedOption.classList.add("loading");

  // Store selected payment method
  const bookingData = JSON.parse(
    localStorage.getItem("currentBooking") || "{}"
  );
  bookingData.paymentMethod = paymentMethod;
  localStorage.setItem("currentBooking", JSON.stringify(bookingData));

  // Simulate processing time
  setTimeout(() => {
    selectedOption.classList.remove("loading");

    // Add success animation
    selectedOption.style.transform = "scale(0.95)";
    selectedOption.style.backgroundColor = "#e8f5e8";
    selectedOption.style.borderColor = "#4caf50";

    setTimeout(() => {
      selectedOption.style.transform = "scale(1)";

      // Navigate to payment confirmation
      setTimeout(() => {
        window.location.href = "payment_confirmation.html";
      }, 300);
    }, 200);
  }, 800);
}

function loadSelectedPaymentMethod() {
  const bookingData = JSON.parse(
    localStorage.getItem("currentBooking") || "{}"
  );
  if (bookingData.paymentMethod) {
    // Highlight previously selected payment method
    const paymentOptions = document.querySelectorAll(".payment-option");
    paymentOptions.forEach((option) => {
      const paymentName = option.querySelector(".payment-name").textContent;
      if (paymentName === bookingData.paymentMethod) {
        option.classList.add("selected");
      }
    });
  }
}

function goBack() {
  window.location.href = "seat_selection.html";
}

// Handle payment method selection with keyboard
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    const focusedElement = document.activeElement;
    if (focusedElement.classList.contains("payment-option")) {
      const paymentName =
        focusedElement.querySelector(".payment-name").textContent;
      selectPaymentMethod(paymentName, focusedElement);
    }
  }
});
