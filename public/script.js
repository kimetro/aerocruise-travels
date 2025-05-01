document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('search-button');
  const searchResults = document.getElementById('search-results');
  const searchResultsLoader = document.getElementById('search-results-loader');
  const searchResultsSeparator = document.getElementById('search-results-separator');
  const originInput = document.getElementById('origin-input');
  const destinationInput = document.getElementById('destination-input');
  const originOptions = document.getElementById('origin-options');
  const destinationOptions = document.getElementById('destination-options');
  const flightTypeSelect = document.getElementById('flight-type-select');
  const returnDateInput = document.getElementById('return-date-input');
  const returnDateContainer = returnDateInput.closest('.col');

  // Toggle return date visibility
  function toggleReturnDate() {
    if (flightTypeSelect.value === 'round-trip') {
      returnDateContainer.style.display = 'block';
    } else {
      returnDateContainer.style.display = 'none';
    }
  }
  toggleReturnDate();
  flightTypeSelect.addEventListener('change', toggleReturnDate);

  // Initialize flatpickr
  flatpickr("#departure-date-input", { dateFormat: "Y-m-d", minDate: "today" });
  flatpickr("#return-date-input", { dateFormat: "Y-m-d", minDate: "today" });

  // Enhanced autocomplete with name + country
  const fetchAutocompleteSuggestions = async (input, datalist) => {
    const keyword = input.value.trim();
    if (keyword.length < 3) {
      datalist.innerHTML = '';
      return;
    }
    try {
      const response = await fetch(`/api/autocomplete?keyword=${encodeURIComponent(keyword)}`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      datalist.innerHTML = '';
      data.forEach(location => {
        const option = document.createElement('option');
        option.value = location.iataCode;
        option.textContent = `${location.name}, ${location.countryName} (${location.iataCode})`;
        datalist.appendChild(option);
      });
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
  };
  originInput.addEventListener('input', () => fetchAutocompleteSuggestions(originInput, originOptions));
  destinationInput.addEventListener('input', () => fetchAutocompleteSuggestions(destinationInput, destinationOptions));

  searchButton.addEventListener('click', async () => {
    searchResults.innerHTML = '';
    searchResultsSeparator.style.display = 'none';
    searchResultsLoader.style.display = 'flex';

    const origin = originInput.value;
    const destination = destinationInput.value;
    const departureDate = document.getElementById('departure-date-input').value;
    const returnDate = document.getElementById('return-date-input').value;
    const travelClass = document.getElementById('travel-class-select').value;
    const adults = parseInt(document.getElementById('adults-input').value) || 1;
    const children = parseInt(document.getElementById('children-input').value) || 0;
    const infants = parseInt(document.getElementById('infants-input').value) || 0;
    const flightType = flightTypeSelect.value;

    if (!origin || !destination || !departureDate || (flightType === 'round-trip' && !returnDate)) {
      alert('Please fill all required fields');
      searchResultsLoader.style.display = 'none';
      return;
    }

    const queryParams = new URLSearchParams({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      travelClass,
      adults,
      children,
      infants,
      ...(flightType === 'round-trip' ? { returnDate } : {})
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
                <button class="btn btn-outline-primary btn-sm">Book Now</button>
              </div>
            </div></div>
          `;

          listItem.innerHTML = html;
          searchResults.appendChild(listItem);
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
});
