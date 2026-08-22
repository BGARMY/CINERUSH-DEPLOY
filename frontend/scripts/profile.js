document.addEventListener("DOMContentLoaded", () => {
  // Lucide icons initialization
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Logout button logic with confirmation
  const logoutBtn = document.querySelector(".menu-item.logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      document.getElementById("logoutModal").style.display = "flex";
    });
  }

  // Cancel button hides the modal
  document.getElementById("cancelLogoutBtn").addEventListener("click", () => {
    document.getElementById("logoutModal").style.display = "none";
  });

  // Bottom navigation logic
  const navButtons = document.querySelectorAll(".bottom-nav button");
  navButtons.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      switch (idx) {
        case 0:
          window.location.href = "home.html";
          break;
        case 1:
          window.location.href = "my_ticket.html";
          break;
        case 2:
          window.location.href = "profile.html";
          break;
      }
    });
  });
});

// Confirm button logs out and redirects
document.getElementById("confirmLogoutBtn").addEventListener("click", () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("userTickets");
  localStorage.removeItem("currentTicket");
  localStorage.removeItem("currentBooking");
  document.getElementById("logoutModal").style.display = "none";
  window.location.href = "signin.html";
});