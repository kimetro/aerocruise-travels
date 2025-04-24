document.addEventListener('DOMContentLoaded', () => {

    const flightForm = document.getElementById('flight-form');
 
    flightForm.addEventListener('submit', async (event) => {

        event.preventDefault();
 
        // Collect form data

        const formData = {

            origin: document.getElementById('origin').value,

            destination: document.getElementById('destination').value,

            departureDate: document.getElementById('departure-date').value,

            adults: document.getElementById('adults').value,

        };
 
        try {

            // Send request to backend

            const response = await fetch('/api/flights', {

                method: 'POST',

                headers: {

                    'Content-Type': 'application/json',

                },

                body: JSON.stringify(formData),

            });
 
            const flightData = await response.json();
 
            if (response.ok) {

                displayFlightResults(flightData);

            } else {

                alert('Error fetching flight data');

            }

        } catch (error) {

            console.error('Error:', error);

            alert('An error occurred while fetching flight data.');

        }

    });
 
    function displayFlightResults(data) {

        const resultsContainer = document.getElementById('flight-results');

        resultsContainer.innerHTML = '';
 
        if (!data.data || data.data.length === 0) {

            resultsContainer.innerHTML = '<p>No flights found.</p>';

            return;

        }
 
        data.data.forEach((flight) => {

            const flightCard = document.createElement('div');

            flightCard.classList.add('flight-card');

            flightCard.innerHTML = `
<h4>${flight.itineraries[0].segments[0].carrierCode} Flight</h4>
<p>From: ${flight.itineraries[0].segments[0].departure.iataCode}</p>
<p>To: ${flight.itineraries[0].segments[0].arrival.iataCode}</p>
<p>Date: ${flight.itineraries[0].segments[0].departure.at}</p>
<p>Price: $${flight.price.total}</p>

            `;

            resultsContainer.appendChild(flightCard);

        });

    }

});
 
 