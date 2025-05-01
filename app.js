const express = require("express");
const Amadeus = require("amadeus");
require("dotenv").config();

const app = express();
const port = 4000;

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.API_KEY,
  clientSecret: process.env.API_SECRET,
});

// Serve static frontend files
app.use(express.static("public"));
app.use(express.json());

// 🔍 Autocomplete endpoint
app.get("/api/autocomplete", async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({ error: "Keyword is required" });
    }

    const { data } = await amadeus.referenceData.locations.get({
      keyword,
      subType: Amadeus.location.city,
    });

    res.json(data);
  } catch (error) {
    console.error("❌ Autocomplete error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch autocomplete data" });
  }
});

// ✈️ Flight search endpoint
app.get("/api/search", async (req, res) => {
  try {
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      travelClass,
      adults,
      children,
      infants,
    } = req.query;

    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      return res.status(400).json({ error: "Origin, destination, and departure date are required" });
    }

    const { data } = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      travelClass,
      adults: parseInt(adults, 10) || 1,
      children: parseInt(children, 10) || 0,
      infants: parseInt(infants, 10) || 0,
      ...(returnDate ? { returnDate } : {}),
    });

    console.log("✅ Flight search successful");
    res.json({ data });
  } catch (error) {
    console.error("❌ Flight search error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch flight data" });
  }
});

// 🧾 Airline info endpoint (name + code)
app.get("/api/airline", async (req, res) => {
  try {
    const { airlineCodes } = req.query;
    if (!airlineCodes) {
      return res.status(400).json({ error: "airlineCodes query is required" });
    }

    const { data } = await amadeus.referenceData.airlines.get({
      airlineCodes: airlineCodes,
    });

    res.json(data);
  } catch (error) {
    console.error("❌ Airline lookup error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch airline name" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
