document.getElementById("uploadBtn").addEventListener("click", () => {
    const feedback = document.getElementById("feedbackMessage");
    feedback.innerText = "Starting process for data upload ...";

    processGasCSV()
        .then(() => {
            feedback.innerText = "Processing completed successfully!";
        })
        .catch((error) => {
            feedback.innerText = `Error during processing: ${error.message}`;
        });
});

async function processGasCSV() {
    const apiUrl = "http://127.0.0.1:8090/api/collections/Readings/records";
    const startReadingId = 3001; // Start reading_id from latest reading_id in this table record
    let currentReadingId = startReadingId;

    // Fetch the uploaded CSV file
    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];

    if (!file) {
        throw new Error("No file selected.");
    }

    const fileData = await file.text();
    const lines = fileData.split("\n").filter(line => line.trim() !== "");

    if (lines.length < 5) {
        throw new Error("Invalid CSV format.");
    }

    const headers = lines[0].split(",");
    const deviceIds = lines[2].split(",");
    const readings = lines.slice(4);

    for (let i = 1; i < headers.length; i++) {
        const deviceNameRaw = headers[i].trim();
        const deviceName = deviceNameRaw.replace(/\(.*\)/, "").trim();
        const locationMatch = deviceNameRaw.match(/\((.*?)\)/);
        const location = locationMatch ? locationMatch[1] : "";

        const deviceId = deviceIds[i].trim();
        const readingsForDevice = readings.map(row => {
            const cols = row.split(",");
            return {
                timestamp: cols[0].trim(),
                value: cols[i]?.trim(),
            };
        });
        console.log("Creating device  : "+deviceName+" deviceId:"+deviceId);
        try {
            // Upload Device_Master record - change device_type Gas or Electric as per csv file
            const deviceResponse = await uploadToPocketBase("Device_Master", {
                device_id: deviceId,
                device_name: deviceName,
                device_type: "Electric",
                location: location,
                installation_date: new Date().toISOString(),
                status: 1,
            });

            console.log("Device Uploaded: ", deviceResponse);
            // Upload Readings for this device
            for (const reading of readingsForDevice) {
                if (reading.value) {
                    console.log("Creating reading: ", deviceId+" currentReadingId: "+currentReadingId+" reading.value:"+reading.value);
                    await uploadToPocketBase("Readings", {
                        reading_id: currentReadingId++,
                        device_id: deviceId,
                        reading_value: parseFloat(reading.value),
                        reading_timestamp: new Date(reading.timestamp).toISOString(),
                    });
                }
            }
        } catch (error) {
            console.error("Error processing device:", deviceName, error);
        }
    }
}

async function uploadToPocketBase(collection, data) {
    const apiUrl = `http://127.0.0.1:8090/api/collections/${collection}/records`;
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Authorization": "Bearer YOUR_API_TOKEN", // Replace with your PocketBase token
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to upload to ${collection}: ${await response.text()}`);
    }

    return await response.json();
}
