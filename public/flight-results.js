document.addEventListener("DOMContentLoaded", async () => {
    const searchResults = document.getElementById('search-results');
    const searchResultsLoader = document.getElementById('search-results-loader');
    const searchResultsSeparator = document.getElementById('search-results-separator');
  
    const searchParams = JSON.parse(localStorage.getItem("searchParams") || "{}");
  
    if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) {
      searchResults.innerHTML = '<div class="col-12"><div class="alert alert-warning">Missing search parameters.</div></div>';
      return;
    }
  
    searchResultsLoader.style.display = 'flex';
  
    const queryParams = new URLSearchParams({
        originLocationCode: searchParams.origin,
        destinationLocationCode: searchParams.destination,
        departureDate: searchParams.departureDate,
        travelClass: searchParams.travelClass,
        adults: searchParams.adults,
        children: searchParams.children,
        infants: searchParams.infants,
        currencyCode: searchParams.currency, // ✅ added
        ...(searchParams.flightType === 'round-trip' ? { returnDate: searchParams.returnDate } : {})
      }).toString();      
  
    try {
      const response = await fetch(`/api/search?${queryParams}`);
      const data = await response.json();
  
      if (data.data && data.data.length > 0) {
        data.data.forEach(flight => {
          const listItem = document.createElement('div');
          listItem.className = 'col-12';
  
          const carrierCode = flight.validatingAirlineCodes?.[0] || 'XX';
          const airlineLogo = `https://content.airhex.com/content/logos/airlines_${carrierCode}_50_50_s.png`;
  
          let html = `
            <div class="card mb-3 shadow-sm flight-card">
              <div class="card-body">
                <div class="d-flex align-items-center mb-2">
                  <img src="${airlineLogo}" alt="${carrierCode}" class="me-2" height="40">
                  <h6 class="mb-0">${carrierCode} — ${flight.travelerPricings.length} Passenger(s)</h6>
                </div>
          `;
  
          flight.itineraries.forEach(itinerary => {
            itinerary.segments.forEach((segment, idx) => {
              html += `
                <div class="mb-2">
                  <strong>${segment.departure.iataCode}</strong> → <strong>${segment.arrival.iataCode}</strong><br>
                  Departure: ${new Date(segment.departure.at).toLocaleString()}<br>
                  Arrival: ${new Date(segment.arrival.at).toLocaleString()}
                </div>
              `;
              if (idx < itinerary.segments.length - 1) html += '<hr>';
            });
          });
  
          html += `
              <div class="d-flex justify-content-between align-items-center mt-3">
                <strong class="text-success">${flight.price.total} ${flight.price.currency}</strong>
                <button class="btn btn-outline-primary btn-sm book-button">Book Now</button>
              </div>
            </div></div>`;
  
          listItem.innerHTML = html;
          searchResults.appendChild(listItem);
  
          listItem.querySelector(".book-button").addEventListener("click", () => {
            localStorage.setItem("selectedFlight", JSON.stringify(flight));
            window.location.href = "/flight-booking.html";
          });
        });
      } else {
        searchResults.innerHTML = '<div class="col-12"><div class="alert alert-warning">No flights found.</div></div>';
      }
    } catch (error) {
      console.error('Search error:', error);
      searchResults.innerHTML = '<div class="col-12"><div class="alert alert-danger">Failed to fetch flight data. Try again later.</div></div>';
    } finally {
      searchResultsLoader.style.display = 'none';
      searchResultsSeparator.style.display = 'block';
    }
  });
  