async function submitBooking(e) {
  if (e) e.preventDefault();
  const userId = document.getElementById('userId')?.value ?? document.querySelector('[name="userId"]')?.value;
  const showtimeId = document.getElementById('showtimeId')?.value ?? document.querySelector('[name="showtimeId"]')?.value;
  const seatNumber = document.getElementById('seatNumber')?.value ?? document.querySelector('[name="seatNumber"]')?.value;

  if (!userId || !showtimeId || !seatNumber) {
    alert('Please fill all booking details.');
    return;
  }

  try {
    const res = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, showtimeId, seats: [seatNumber] })
    });

    const data = await res.json();

    if (res.ok && data.bookingId) {
      sessionStorage.setItem('bookingId', data.bookingId);
      window.location.href = 'payment_confirmation.html?bookingId=' + encodeURIComponent(data.bookingId);
    } else {
      alert(data.message || data.error || 'Booking failed');
    }
  } catch (err) {
    alert('Network error. Please try again.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookingForm');
  if (form) form.addEventListener('submit', submitBooking);
});