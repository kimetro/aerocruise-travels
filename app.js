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

// 🧾 Booking endpoint
app.post("/api/book", async (req, res) => {
  const { flight, travelers } = req.body;

  if (!flight || !travelers || travelers.length === 0) {
    return res.status(400).json({ error: "Missing flight or traveler data" });
  }

  const payload = {
    data: {
      type: "flight-order",
      flightOffers: [flight],
      travelers: travelers
    }
  };

  console.log("📦 Booking payload:", JSON.stringify(payload, null, 2));

  try {
    const attemptBooking = async (tries = 3) => {
      for (let i = 0; i < tries; i++) {
        try {
          const response = await amadeus.booking.flightOrders.post(JSON.stringify(payload)); // ← No stringify here
          return response.result;
        } catch (err) {
          console.warn(`Attempt ${i + 1} failed:`);
          console.error("Status:", err?.response?.status);
          console.error("Data:", err?.response?.data);
          console.error("Message:", err.message);
          console.error("Stack:", err.stack);
          if (i === tries - 1) throw err;
        }
      }
    };

    const result = await attemptBooking();
    console.log("✅ Booking successful:", result.data.id);
    res.json(result);
  } catch (error) {
    console.error("❌ Booking failed:");
    console.error("Status:", error?.response?.status);
    console.error("Data:", error?.response?.data);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ error: "Failed to complete booking. Please try again later." });
  }
});

//email endpoint
const nodemailer = require("nodemailer");

app.post("/api/email", async (req, res) => {
  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: "Missing email content." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use SMTP details
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Aerocruise Travels" <${process.env.EMAIL_USER}>`,
      to: [to, process.env.ADMIN_EMAIL], // send to user and your address
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Email error:", err.message);
    res.status(500).json({ error: "Failed to send email." });
  }
});
