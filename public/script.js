document.addEventListener("DOMContentLoaded", async () => {
  const searchButton = document.getElementById('search-button');
  const originInput = document.getElementById('origin-input');
  const destinationInput = document.getElementById('destination-input');
  const originOptions = document.getElementById('origin-options');
  const destinationOptions = document.getElementById('destination-options');
  const flightTypeSelect = document.getElementById('flight-type-select');
  const returnDateInput = document.getElementById('return-date-input');
  const returnDateContainer = returnDateInput.closest('.col');

  // Toggle return date field
  function toggleReturnDate() {
    returnDateContainer.style.display = flightTypeSelect.value === 'round-trip' ? 'block' : 'none';
  }
  toggleReturnDate();
  flightTypeSelect.addEventListener('change', toggleReturnDate);

  // Date pickers
  flatpickr("#departure-date-input", { dateFormat: "Y-m-d", minDate: "today" });
  flatpickr("#return-date-input", { dateFormat: "Y-m-d", minDate: "today" });

  // Detect user currency via IP geolocation
  let userCurrency = "USD"; // fallback
  try {
    const res = await fetch("https://ipapi.co/json/");
    const geo = await res.json();
    if (geo && geo.currency) userCurrency = geo.currency;
    localStorage.setItem("userCurrency", userCurrency);
  } catch (err) {
    console.warn("Could not determine user currency:", err.message);
  }

  // Debounce helper
  function debounce(func, delay = 300) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }

  // Autocomplete
  async function fetchAutocompleteSuggestions(input, datalist) {
    const keyword = input.value.trim();
    if (keyword.length < 3) {
      datalist.innerHTML = '';
      return;
    }
    try {
      const response = await fetch(`/api/autocomplete?keyword=${encodeURIComponent(keyword)}`);
      if (!response.ok) throw new Error('Autocomplete API failed');
      const data = await response.json();
      datalist.innerHTML = '';
      data.forEach(location => {
        const name = location.name;
        const code = location.iataCode;
        const country = location.address?.countryName || '';
        const city = location.address?.cityName || name;
        const label = `${name} (${code}) – ${city}, ${country}`;
        const option = document.createElement('option');
        option.value = code;
        option.textContent = label;
        datalist.appendChild(option);
      });
    } catch (err) {
      console.error("❌ Autocomplete error:", err.message || err);
    }
  }

  originInput.addEventListener('input', debounce(() => fetchAutocompleteSuggestions(originInput, originOptions)));
  destinationInput.addEventListener('input', debounce(() => fetchAutocompleteSuggestions(destinationInput, destinationOptions)));

  // Handle Search
  searchButton.addEventListener("click", () => {
    const searchParams = {
      origin: originInput.value.trim(),
      destination: destinationInput.value.trim(),
      departureDate: document.getElementById("departure-date-input").value,
      returnDate: document.getElementById("return-date-input").value,
      travelClass: document.getElementById("travel-class-select").value,
      adults: document.getElementById("adults-input").value,
      children: document.getElementById("children-input").value,
      infants: document.getElementById("infants-input").value,
      flightType: flightTypeSelect.value,
      currency: userCurrency
    };

    if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate ||
        (searchParams.flightType === 'round-trip' && !searchParams.returnDate)) {
      alert("Please fill in all required fields.");
      return;
    }

    localStorage.setItem("searchParams", JSON.stringify(searchParams));
    window.location.href = "/flight-results.html";
  });
});
