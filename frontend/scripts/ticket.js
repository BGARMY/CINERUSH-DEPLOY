// ticket.js - load ticket from localStorage

document.addEventListener('DOMContentLoaded', () => {

  const closeBtn = document.getElementById('closeBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.location.href = 'home.html'; // or any page you want to redirect to
    });
  }

  const ticket = JSON.parse(localStorage.getItem('currentTicket') || '{}');
  if (!ticket.movie || !ticket.seats) {
    alert('No ticket found. Please book a ticket first.');
    return;
  }

  // Populate DOM elements
  const movieEl = document.getElementById('movieTitle');
  if (movieEl) movieEl.textContent = ticket.movie;

  const cinemaEl = document.getElementById('cinemaName');
  if (cinemaEl) cinemaEl.textContent = ticket.cinema;

  const seatEl = document.getElementById('seatNumber');
  if (seatEl) seatEl.textContent = Array.isArray(ticket.seats) ? ticket.seats.join(', ') : ticket.seats;

  const timeEl = document.getElementById('showtime');
  if (timeEl) timeEl.textContent = `${ticket.date} ${ticket.time}`;

  const paymentEl = document.getElementById('paymentMethod');
  if (paymentEl) paymentEl.textContent = ticket.paymentMethod || '';

  const priceEl = document.getElementById('ticketPrice');
  if (priceEl && ticket.pricing) priceEl.textContent = `₹${ticket.pricing.total}.00`;

  // Optionally show ticket ID
  const ticketIdEl = document.getElementById('ticketId');
  if (ticketIdEl) ticketIdEl.textContent = ticket.id || '';
});