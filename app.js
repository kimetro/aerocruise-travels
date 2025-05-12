const express = require("express");
const Amadeus = require("amadeus");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");
const Database = require("better-sqlite3");

// Load environment variables
dotenv.config();

const app = express();
const port = 4000;

// Initialize database
const db = new Database("aerocruise.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pnr TEXT,
    firstName TEXT,
    lastName TEXT,
    email TEXT,
    phone TEXT,
    origin TEXT,
    destination TEXT,
    departureDate TEXT,
    returnDate TEXT,
    price TEXT,
    currency TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.API_KEY,
  clientSecret: process.env.API_SECRET,
});

// Middleware
app.use(express.static("public"));
app.use(express.json());

app.use(session({
  secret: "aerocruise-admin-secret", // 🔐 Replace with strong secret in production
  resave: false,
  saveUninitialized: false
}));

// Admin credentials
const adminUser = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};

// 🔒 Admin auth middleware
function requireAdminAuth(req, res, next) {
  if (req.session.admin) return next();
  res.status(401).json({ error: "Unauthorized" });
}

// 🌐 Routes

// 🔐 Admin login
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  if (email === adminUser.email && password === adminUser.password) {
    req.session.admin = true;
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

app.get("/api/admin/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin-login.html"));
});

// 🔍 Autocomplete
app.get("/api/autocomplete", async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({ error: "Keyword is required" });
    }

    const { data } = await amadeus.referenceData.locations.get({
      keyword,
      subType: "AIRPORT,CITY"  // Correct string format
    });

    res.json(data);
  } catch (error) {
    console.error("❌ Autocomplete error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch autocomplete data" });
  }
});

// ✈️ Flight search
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
      currencyCode // ✅ added
    } = req.query;

    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      return res.status(400).json({ error: "Origin, destination, and departure date are required" });
    }

    const { data } = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      travelClass,
      currencyCode, // ✅ added to query
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

// 🛫 Book a flight
app.post("/api/book", async (req, res) => {
  const { flight, travelers } = req.body;

  if (!flight || !travelers || travelers.length === 0) {
    return res.status(400).json({ error: "Missing flight or traveler data" });
  }

  const payload = {
    data: {
      type: "flight-order",
      flightOffers: [flight],
      travelers: travelers,
    },
  };

  try {
    const response = await amadeus.booking.flightOrders.post(JSON.stringify(payload));
    const result = response.result;

    // Save booking
    const traveler = travelers[0];
    const seg = flight.itineraries[0].segments[0];

    db.prepare(`
      INSERT INTO bookings (pnr, firstName, lastName, email, phone, origin, destination, departureDate, returnDate, price, currency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      result.data.id,
      traveler.name.firstName,
      traveler.name.lastName,
      traveler.contact.emailAddress,
      traveler.contact.phones[0]?.number || "",
      seg.departure.iataCode,
      seg.arrival.iataCode,
      seg.departure.at.split("T")[0],
      flight.itineraries[1]?.segments[0]?.departure?.at?.split("T")[0] || "",
      flight.price.total,
      flight.price.currency
    );

    console.log("✅ Booking saved");
    res.json(result);
  } catch (error) {
    console.error("❌ Booking failed:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to complete booking" });
  }
});

// 📄 Airline info
app.get("/api/airline", async (req, res) => {
  try {
    const { airlineCodes } = req.query;
    if (!airlineCodes) return res.status(400).json({ error: "airlineCodes query is required" });

    const { data } = await amadeus.referenceData.airlines.get({ airlineCodes });
    res.json(data);
  } catch (error) {
    console.error("❌ Airline lookup error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch airline name" });
  }
});

// 🔐 Admin bookings view (protected)
app.get("/api/bookings", requireAdminAuth, (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM bookings ORDER BY createdAt DESC").all();
    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch bookings:", err.message);
    res.status(500).json({ error: "Unable to fetch bookings" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
