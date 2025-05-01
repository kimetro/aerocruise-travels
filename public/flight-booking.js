// flight-booking.js

const summaryDiv = document.getElementById("flight-summary");
const statusDiv = document.getElementById("booking-status");
const form = document.getElementById("booking-form");

const selectedFlight = JSON.parse(localStorage.getItem("selectedFlight"));

if (!selectedFlight) {
  summaryDiv.innerHTML = '<div class="alert alert-warning">No flight selected. Please go back and choose a flight.</div>';
  form.style.display = "none";
} else {
  const itinerary = selectedFlight.itineraries[0].segments[0];
  summaryDiv.innerHTML = `
    <h5>Flight: ${itinerary.departure.iataCode} → ${itinerary.arrival.iataCode}</h5>
    <p>Departure: ${new Date(itinerary.departure.at).toLocaleString()}</p>
    <p>Arrival: ${new Date(itinerary.arrival.at).toLocaleString()}</p>
    <p><strong>Price: ${selectedFlight.price.total} ${selectedFlight.price.currency}</strong></p>
  `;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const traveler = {
    id: "1",
    dateOfBirth: document.getElementById("dob").value,
    name: {
      firstName: document.getElementById("first-name").value,
      lastName: document.getElementById("last-name").value
    },
    gender: document.getElementById("gender").value,
    contact: {
      emailAddress: document.getElementById("email").value,
      phones: [{
        deviceType: "MOBILE",
        countryCallingCode: "44",
        number: document.getElementById("phone").value
      }]
    },
    documents: [{
        documentType: "PASSPORT",
        number: document.getElementById("passport-number").value,
        expiryDate: document.getElementById("passport-expiry").value,
        issuanceCountry: document.getElementById("passport-country").value,
        nationality: document.getElementById("nationality").value,
        holder: true
      }]      
  };

  try {
    const response = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flight: selectedFlight,
        travelers: [traveler]
      })
    });

    const result = await response.json();
    if (response.ok) {
        localStorage.setItem("confirmedBooking", JSON.stringify({
          flight: selectedFlight,
          traveler,
          pnr: result.data.id
        }));
        window.location.href = "/confirmation.html";
      }
      else {
      statusDiv.innerHTML = `<div class="alert alert-danger">Failed: ${result.error || "Something went wrong"}</div>`;
    }
  } catch (err) {
    console.error(err);
    statusDiv.innerHTML = `<div class="alert alert-danger">Unexpected error occurred.</div>`;
  }
});

