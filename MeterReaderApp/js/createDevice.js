const form = document.getElementById('deviceForm');
const responseMessage = document.getElementById('responseMessage');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const deviceIdInput = document.getElementById("device_id");
    const deviceId = Number(deviceIdInput.value);

    // Validate if Device ID is greater than 0
    if (deviceId <= 0) {
        event.preventDefault(); // Prevent form submission
        alert("Device ID must be greater than 0.");
        deviceIdInput.focus(); // Focus on the invalid input field
    }
    
    try {

        // API call to check if the device ID already exists
        const checkDeviceResponse = await fetch(`http://127.0.0.1:8090/api/collections/Device_Master/records?filter=device_id=${deviceId}`);
        
        if (!checkDeviceResponse.ok) {
            throw new Error('Failed to check existing device ID.');
        }

        const checkDeviceResult = await checkDeviceResponse.json();

        // If a record exists, show an error
        if (checkDeviceResult.items && checkDeviceResult.items.length > 0) {
            alert("Device ID already exists!");
            deviceIdInput.focus(); // Focus on the invalid input field
            return; // Stop further processing
        }

        const response = await fetch('http://127.0.0.1:8090/api/collections/Device_Master/records', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'Authorization': 'Bearer YOUR_API_KEY', // Replace YOUR_API_KEY with the actual key
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            responseMessage.textContent = 'Record added successfully!';
            responseMessage.style.color = 'green';
            form.reset();
        } else {
            const error = await response.json();
            responseMessage.textContent = `Error: ${error.message}`;
            responseMessage.style.color = 'red';
        }
    } catch (error) {
        responseMessage.textContent = `Error: ${error.message}`;
        responseMessage.style.color = 'red';
    }
});
