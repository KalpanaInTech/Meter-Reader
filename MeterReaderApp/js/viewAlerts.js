// Base URL of your PocketHost instance
const BASE_URL = "http://127.0.0.1:8090";

// Fetch all alerts from PocketBase
async function fetchAlerts() {
    try {
        const response = await fetch(`${BASE_URL}/api/collections/Alerts/records?sort=-created`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch alerts");
        }

        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error("Error fetching alerts:", error);
        return [];
    }
}

// Display alerts in the table
async function displayAlerts() {
    const alertsTableBody = document.querySelector("#alertsTable tbody");
    alertsTableBody.innerHTML = ""; // Clear existing rows

    const alerts = await fetchAlerts();

    alerts.forEach(alert => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${alert.alert_id}</td>
            <td>${alert.device_id}</td>
            <td>${alert.alert_type}</td>
            <td>${alert.message}</td>
            <td>${alert.alert_reading}</td>
            <td>${alert.status}</td>
            <td>${new Date(alert.created).toLocaleString()}</td>
        `;
        alertsTableBody.appendChild(row);
    });
}

// Initialize page 
document.addEventListener("DOMContentLoaded", displayAlerts);
