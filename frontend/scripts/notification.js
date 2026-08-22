// Notification functionality
document.addEventListener("DOMContentLoaded", () => {
  // Add fade-in animation to content
  const content = document.querySelector(".content");
  if (content) content.classList.add("fade-in");

  // Add click animations to notification items
  const notificationItems = document.querySelectorAll(".notification-item");
  notificationItems.forEach((item) => {
    item.addEventListener("click", function () {
      this.classList.add("clicked");
      setTimeout(() => {
        this.classList.remove("clicked");
      }, 200);
    });
  });

  // Add touch feedback for better mobile experience
  const interactiveElements = document.querySelectorAll(".notification-item, .back-btn");
  interactiveElements.forEach((element) => {
    element.addEventListener("touchstart", function () {
      this.style.transform = "scale(0.98)";
    });
    element.addEventListener("touchend", function () {
      setTimeout(() => {
        this.style.transform = "scale(1)";
      }, 100);
    });
  });

  // Check read status on load
  checkReadStatus();
});

function openNotification(notificationId) {
  // Example: redirect to movie details or booking page based on notification
  if (notificationId === 'coolie-today') {
    window.location.href = '/movie_booking.html?movie=Coolie';
  } else if (notificationId === 'war2-today' || notificationId === 'war2-yesterday') {
    window.location.href = '/movie_booking.html?movie=War%202';
  } else {
    alert('Notification clicked: ' + notificationId);
  }
}

function goBack() {
  window.history.back();
}

function markAsRead(notificationId) {
  // Store read status in localStorage
  const readNotifications = JSON.parse(localStorage.getItem("readNotifications") || "[]");
  if (!readNotifications.includes(notificationId)) {
    readNotifications.push(notificationId);
    localStorage.setItem("readNotifications", JSON.stringify(readNotifications));
  }
  // Update UI to show as read (could add visual indicator)
  console.log("Notification marked as read:", notificationId);
}

function checkReadStatus() {
  const readNotifications = JSON.parse(localStorage.getItem("readNotifications") || "[]");
  const notificationItems = document.querySelectorAll(".notification-item");

  notificationItems.forEach((item) => {
    const onclickAttr = item.getAttribute("onclick");
    if (!onclickAttr) return;
    const match = onclickAttr.match(/'([^']+)'/);
    if (!match) return;
    const notificationId = match[1];
    if (readNotifications.includes(notificationId)) {
      item.style.opacity = "0.7";
    }
  });
}

// Simulate real-time notifications (for demo purposes)
function simulateNewNotification() {
  console.log("New notification received!");
  // In a real app, this would add new notifications to the list
  // and possibly show a badge or alert
}