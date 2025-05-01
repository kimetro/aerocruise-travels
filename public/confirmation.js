// confirmation.js

document.addEventListener("DOMContentLoaded", () => {
    const summary = document.getElementById("confirmation-summary");
  
    const confirmedBooking = JSON.parse(localStorage.getItem("confirmedBooking"));
    if (!confirmedBooking) {
      summary.innerHTML = '<div class="alert alert-warning">No booking information available.</div>';
      return;
    }
  
    const flight = confirmedBooking.flight;
    const traveler = confirmedBooking.traveler;
    const pnr = confirmedBooking.pnr;
    const segment = flight.itineraries[0].segments[0];
  
    summary.innerHTML = `
    <h4 class="text-primary">Booking Reference: <strong>${pnr}</strong></h4>
    <hr>
    <h5>Flight Details</h5>
    <p><strong>${segment.departure.iataCode}</strong> → <strong>${segment.arrival.iataCode}</strong></p>
    <p>Departure: ${new Date(segment.departure.at).toLocaleString()}</p>
    <p>Arrival: ${new Date(segment.arrival.at).toLocaleString()}</p>
    <p><strong>Price:</strong> ${flight.price.total} ${flight.price.currency}</p>
    <hr>
    <h5>Passenger</h5>
    <p>${traveler.name.firstName} ${traveler.name.lastName}</p>
    <p><strong>Email:</strong> ${traveler.contact.emailAddress}</p>
    <p><strong>Phone:</strong> +${traveler.contact.phones[0].countryCallingCode} ${traveler.contact.phones[0].number}</p>
  `;
  
    // 📧 Send confirmation email to user and admin
    fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: traveler.contact.emailAddress,
        subject: "Your Aerocruise Booking Confirmation",
        html: summary.innerHTML
      })
    }).catch(err => console.error("Email failed:", err));
  
    // Clear confirmed booking after showing (optional)
    // localStorage.removeItem("confirmedBooking");
  });
  