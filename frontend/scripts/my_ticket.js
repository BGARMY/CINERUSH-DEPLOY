document.addEventListener('DOMContentLoaded', async () => {
  const mainContent = document.querySelector('.main-content');
  const userId = localStorage.getItem('userId');

  if (!userId) {
    mainContent.innerHTML = '<p class="no-tickets">Please log in to view your booking history.</p>';
  } else {
    try {
      const res = await fetch(`/api/bookings/tickets?userId=${encodeURIComponent(userId)}`);
      const bookings = await res.json();

      if (!Array.isArray(bookings) || bookings.length === 0) {
        mainContent.innerHTML = '<p class="no-tickets">No bookings found.</p>';
      } else {
        mainContent.innerHTML = '';
        bookings.forEach(booking => {
          const seatCount = booking.seat_number ? booking.seat_number.split(',').length : 1;
          const bookingDate = booking.show_date || (booking.booking_time ? booking.booking_time.split('T')[0] : '');
          const bookingTime = booking.show_time || (booking.booking_time ? booking.booking_time.split('T')[1].slice(0,5) : '');

          const bookingDiv = document.createElement('div');
          bookingDiv.className = 'ticket-card';
          bookingDiv.innerHTML = `
            <div class="ticket-info">
              <h3 class="movie-name">${booking.movie_title}</h3>
              <p class="ticket-date"><strong>Date:</strong> ${bookingDate}</p>
              <p class="ticket-time"><strong>Show Time:</strong> ${bookingTime}</p>
              <p class="ticket-seats"><strong>Seats:</strong> ${seatCount} (${booking.seat_number})</p>
              <p class="ticket-status"><strong>Status:</strong> ${booking.status}</p>
            </div>
          `;
          bookingDiv.style.cursor = 'pointer';
          bookingDiv.onclick = () => {
            window.location.href = `ticket.html?id=${booking.id}`;
          };
          mainContent.appendChild(bookingDiv);
        });
      }
    } catch (err) {
      mainContent.innerHTML = '<p class="no-tickets">Error loading booking history. Please try again.</p>';
    }
  }

  // Bottom navigation logic (always runs)
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