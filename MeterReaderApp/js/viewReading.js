document.addEventListener('DOMContentLoaded', async () => {
    const deviceDropdown = document.getElementById('deviceDropdown');
    const readingsTableBody = document.querySelector('#readingsTable tbody');

    // Fetch devices from PocketBase
    async function fetchDevices() {
        try {
            //https://meterreaderplus.pockethost.io/
            //ttps://meterreaderce2.pockethost.io
            const response = await fetch('http://127.0.0.1:8090/api/collections/Device_Master/records?sort=-created');
            const data = await response.json();
            return data.items;
        } catch (error) {
            console.error('Error fetching devices:', error);
            return [];
        }
    }

    // Fetch readings for a specific device
    async function fetchReadings(deviceId) {
        try {
            const response = await fetch(`http://127.0.0.1:8090/api/collections/Readings/records?filter=device_id='${deviceId}'&sort=-reading_timestamp`);
            const data = await response.json();
            //console.log("fetchReadings:>>>deviceId<<< "+deviceId);
            return data.items;
        } catch (error) {
            console.error('Error fetching readings:', error);
            return [];
        }
    }

    // Populate the dropdown with device names
    async function populateDeviceDropdown() {
        const devices = await fetchDevices();
        devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.device_id;
            option.textContent = device.device_name;
            deviceDropdown.appendChild(option);
        });
    }

    // Display readings in the table
async function displayReadings(deviceId) {
    const readings = await fetchReadings(deviceId);
    readingsTableBody.innerHTML = ''; // Clear previous rows

    if (readings.length === 0) {
        // If no readings are found, display a message
        const noRecordsMessage = document.createElement('tr');
        noRecordsMessage.innerHTML = `
            <td colspan="3" style="text-align: center; color: red;">There is no record found for this device.</td>
        `;
        readingsTableBody.appendChild(noRecordsMessage);
        return;
    }

    // Populate the table with readings
    readings.forEach(reading => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${deviceId}</td>
            <td>${reading.reading_value}</td>
            <td>${new Date(reading.reading_timestamp).toLocaleString()}</td>
        `;
        readingsTableBody.appendChild(row);
    });
}

    /*
    // Display readings in the table
    async function displayReadings(deviceId) {
        const readings = await fetchReadings(deviceId);
        readingsTableBody.innerHTML = ''; // Clear previous rows
        console.log("displayReadings:>>><<<< deviceId>>>><<< "+deviceId);
        readings.forEach(reading => {
            const row = document.createElement('tr');
           
            row.innerHTML = `
                <td>${deviceId}</td>
                <td>${reading.reading_value}</td>
                <td>${new Date(reading.reading_timestamp).toLocaleString()}</td>
            `;
            readingsTableBody.appendChild(row);
        });
    }
    */

    // Event listener for device selection
    deviceDropdown.addEventListener('change', async (event) => {
        const selectedDeviceId = event.target.value;
        if (selectedDeviceId) {
            await displayReadings(selectedDeviceId);
        } else {
            readingsTableBody.innerHTML = ''; // Clear table if no device selected
        }
    });

    // Initialize the page
    await populateDeviceDropdown();
});
