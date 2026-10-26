const API_BASE = "https://wrap-swim-become-relatively.trycloudflare.com";

function reportFallState(detected) {
  document.dispatchEvent(new CustomEvent(
    detected ? "alerta:fall-detected" : "alerta:fall-cleared"
  ));
}

async function refreshSensors() {
  const updated = document.getElementById("sensorUpdated");

  try {
    const response = await fetch(
      `${API_BASE}/api/sensor-data/latest`
    );

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const result = await response.json();
    const data = result.data;

    if (!data) {
      updated.textContent = "Waiting for device data...";
      return;
    }

    if (data.fallDetected === true) reportFallState(true);
    else if (data.fallDetected === false) reportFallState(false);

    document.getElementById("sensorMovement").textContent =
      data.movement != null ? `${data.movement} g` : "-- g";

    document.getElementById("sensorHeartRate").textContent =
      data.heartRate != null ? `${data.heartRate} BPM` : "-- BPM";

    document.getElementById("sensorSound").textContent =
      data.soundLevel != null ? data.soundLevel : "--";

    updated.textContent = result.updatedAt
      ? `Last updated: ${new Date(result.updatedAt).toLocaleTimeString()}`
      : "Connected";

  } catch (error) {
    updated.textContent = "Cannot connect to sensor API.";
    console.error("Sensor API error:", error);
  }
}

refreshSensors();
setInterval(refreshSensors, 2000);