
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "32kb" }));

// Latest sensor reading, stored in memory for this prototype.
let latestReading = null;
let lastUpdated = null;
const alerts = [];

function validateReading(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "A JSON object is required";
  }

  const numericFields = [
    "heartRate",
    "spo2",
    "temperature",
    "airQuality",
    "movement",
    "latitude",
    "longitude",
    "soundLevel"
  ];

  for (const field of numericFields) {
    if (data[field] !== undefined &&
        (typeof data[field] !== "number" ||
         !Number.isFinite(data[field]))) {
      return `${field} must be a finite number`;
    }
  }

  if (data.fallDetected !== undefined &&
      typeof data.fallDetected !== "boolean") {
    return "fallDetected must be true or false";
  }

  if (data.voiceDetected !== undefined &&
      typeof data.voiceDetected !== "boolean") {
    return "voiceDetected must be true or false";
  }

  return null;
}

function receiveSensorData(req, res) {
  const error = validateReading(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  latestReading = { ...req.body };
  lastUpdated = new Date().toISOString();

  const emergency =
    latestReading.fallDetected === true ||
    latestReading.voiceDetected === true;

  if (emergency) {
    alerts.unshift({
      ...latestReading,
      receivedAt: lastUpdated,
      message: latestReading.fallDetected
        ? "Possible fall detected"
        : "Possible voice distress detected"
    });

    // Keep the latest 50 alerts in memory.
    if (alerts.length > 50) alerts.pop();
  }

  console.log("Sensor data received:", latestReading);

  res.json({
    success: true,
    receivedAt: lastUpdated
  });
}

// Support both the existing ESP32 /data URL
// and the new API endpoint.
app.post("/data", receiveSensorData);
app.post("/api/sensor-data", receiveSensorData);

// Website fetches the latest sensor readings.
app.get("/api/sensor-data/latest", (req, res) => {
  res.json({
    success: true,
    data: latestReading,
    updatedAt: lastUpdated
  });
});

// Website fetches recent alerts.
app.get("/api/alerts", (req, res) => {
  res.json({ alerts });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "online" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ALERTA API running on port ${PORT}`);
});
