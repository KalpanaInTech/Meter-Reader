// Base URL of your PocketHost instance
const BASE_URL = "http://127.0.0.1:8090";

/**
 * Fetch device data from the 'Device_Master' collection and populate the dropdown.
 */
async function fetchDevices() {
    const dropdown = document.getElementById("deviceDropdown");
    try {
        const response = await fetch(`${BASE_URL}/api/collections/Device_Master/records?sort=-created`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Check if the response is okay
        if (!response.ok) {
            throw new Error("Failed to fetch device data");
        }

        const data = await response.json();

        // Clear the dropdown first
        dropdown.innerHTML = `<option value="">-- Select a Device --</option>`;

        // Populate the dropdown with data
        data.items.forEach(device => {
            const option = document.createElement("option");
            option.value = device.device_id;
            option.textContent = `${device.device_name}`;
            dropdown.appendChild(option);
        });

        // Add event listener to display the selected ID
        dropdown.addEventListener("change", () => {
            const selectedId = dropdown.value;
            const displayElement = document.getElementById("selectedDeviceId");

            if (selectedId) {
                displayElement.textContent = `Selected Device ID: ${selectedId}`;
            } else {
                displayElement.textContent = ""; // Clear if no selection
            }
        });
    } catch (error) {
        console.error("Error fetching device data:", error);
        dropdown.innerHTML = "<option value=''>Failed to load devices</option>";
    }
}

/**
 * Submit a new reading to the 'Readings' collection.
 */
async function submitReading() {
    const deviceId = document.getElementById("deviceDropdown").value;
    const readingValue = document.getElementById("readingValue").value;
    const readingTimestamp = document.getElementById("readingTimestamp").value;
    const feedbackMessage = document.getElementById("feedbackMessage");

    if (!deviceId) {
        feedbackMessage.textContent = "Please select a device.";
        feedbackMessage.className = "error-message";
        return;
    }

    if (!readingValue || !readingTimestamp) {
        feedbackMessage.textContent = "Please fill in all fields.";
        feedbackMessage.className = "error-message";
        return;
    }

    // Format the timestamp to 'YYYY-MM-DD HH:MM:SS'
    const formattedTimestamp = readingTimestamp.replace("T", " ") + ":00";

    try {
        // Fetch the last reading to determine the next reading_id
        const lastReadingResponse = await fetch(`${BASE_URL}/api/collections/Readings/records?sort=-reading_id&limit=1`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!lastReadingResponse.ok) {
            throw new Error("Failed to fetch last reading for reading_id.");
        }

        const lastReadingData = await lastReadingResponse.json();
        const lastReadingId = lastReadingData.items.length > 0 ? lastReadingData.items[0].reading_id : 0;
        const nextReadingId = lastReadingId + 1;

        // Construct the new reading data
        const readingData = {
            reading_id: nextReadingId,
            device_id: parseInt(deviceId, 10),
            reading_value: parseFloat(readingValue),
            reading_timestamp: formattedTimestamp,
        };

        // Check for alerts before submission
        const lastThreeReadings = await fetchReadings(deviceId);
        const alertMessage = checkForAlert(parseFloat(readingValue), lastThreeReadings);
        if (alertMessage) {
            feedbackMessage.textContent = alertMessage;
            feedbackMessage.className = "warning-message";
        }

        // Submit the new reading to the 'Readings' collection
        const response = await fetch(`${BASE_URL}/api/collections/Readings/records`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(readingData),
        });

        if (!response.ok) {
            throw new Error("Failed to submit reading.");
        }

        feedbackMessage.textContent = "Reading submitted successfully!";
        feedbackMessage.className = "success-message";
        document.getElementById("readingForm").reset();

        if (alertMessage) {
            // Generate the next alert_id
            const alertResponse = await fetch(`${BASE_URL}/api/collections/Alerts/records?sort=-alert_id&limit=1`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const alertData = await alertResponse.json();
            const nextAlertId = alertData.items.length > 0 ? alertData.items[0].alert_id + 1 : 1;

            // Create the alert data
            const alertPayload = {
                alert_id: nextAlertId,
                device_id: parseInt(deviceId, 10),
                alert_type: "High Value",
                message: alertMessage,
                status: "active",
                alert_reading: parseFloat(readingValue),
            };

            // Submit the alert to the 'Alerts' collection
            await fetch(`${BASE_URL}/api/collections/Alerts/records`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(alertPayload),
            });

            feedbackMessage.textContent += " An alert has also been generated.";
        }
    } catch (error) {
        console.error("Error submitting reading or alert:", error);
        feedbackMessage.textContent = "Failed to submit reading and/or alert.";
        feedbackMessage.className = "error-message";
    }
}

/**
 * Fetch the last reading for the selected device.
 */
async function fetchLastReading(deviceId) {
    const lastReadingInput = document.getElementById("lastreadingValue");

    if (!deviceId) {
        lastReadingInput.value = ""; // Clear the field if no device is selected
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/collections/Readings/records?filter=device_id=${deviceId}&sort=-reading_timestamp&limit=1`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch last reading.");
        }

        const data = await response.json();

        if (data && data.items && data.items.length > 0) {
            lastReadingInput.value = data.items[0].reading_value;
        } else {
            lastReadingInput.value = "No readings available";
        }
    } catch (error) {
        console.error("Error fetching last reading:", error);
        lastReadingInput.value = "Error fetching data";
    }
}

/**
 * Calculate alert based on current reading and last 3 readings.
 */
function checkForAlert(currentValue, lastThreeReadings) {
    const total = lastThreeReadings.reduce((sum, reading) => sum + reading.reading_value, 0);
    const average = total / lastThreeReadings.length;
    console.log(`currentValue: ${currentValue} : checkForAlert: total: ${total} : average: ${average}`);
    if (currentValue > average * 1.25) {
        return `Alert: Current reading (${currentValue}) is more than 25% higher than the average of the last 3 readings (${average.toFixed(2)}).`;
    }
    return null;
}

/**
 * Fetch readings for a specific device.
 */
async function fetchReadings(deviceId) {
    try {
        const response = await fetch(`${BASE_URL}/api/collections/Readings/records?filter=device_id=${deviceId}&sort=-reading_timestamp&limit=3`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch readings.");
        }

        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error("Error fetching readings:", error);
        return [];
    }
}

/**
 * Handle device selection and update the last reading.
 */
async function handleDeviceSelection(event) {
    const selectedDeviceId = event.target.value;
    const selectedDeviceIdDisplay = document.getElementById("selectedDeviceId");

    if (selectedDeviceId) {
        selectedDeviceIdDisplay.textContent = `Selected Device ID: ${selectedDeviceId}`;
        await fetchLastReading(selectedDeviceId);
    } else {
        selectedDeviceIdDisplay.textContent = "";
        document.getElementById("lastreadingValue").value = "";
    }
}

// Event listeners
document.getElementById("deviceDropdown").addEventListener("change", handleDeviceSelection);
document.getElementById("readingForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitReading();
});

document.getElementById("readingValue").addEventListener("input", async () => {
    const deviceId = document.getElementById("deviceDropdown").value;
    const currentValue = parseFloat(document.getElementById("readingValue").value);
    const feedbackMessage = document.getElementById("feedbackMessage");

    if (!deviceId || isNaN(currentValue)) {
        feedbackMessage.textContent = "Please select a device and enter a valid current reading.";
        feedbackMessage.style.color = "red";
        feedbackMessage.style.display = "block";
        return;
    }

    const lastThreeReadings = await fetchReadings(deviceId);

    if (lastThreeReadings.length > 0) {
        const alertMessage = checkForAlert(currentValue, lastThreeReadings);
        if (alertMessage) {
            feedbackMessage.textContent = alertMessage;
            feedbackMessage.style.color = "Red";
            feedbackMessage.style.display = "block";
        } else {
            feedbackMessage.textContent = "Current reading is within the acceptable range.";
            feedbackMessage.style.color = "green";
            feedbackMessage.style.display = "block";
        }
    }
});

// Automatically fetch devices on page load
document.addEventListener("DOMContentLoaded", fetchDevices);

