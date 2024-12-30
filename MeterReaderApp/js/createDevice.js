const form = document.getElementById('deviceForm');
const responseMessage = document.getElementById('responseMessage');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('https://meterreaderce2.pockethost.io/api/collections/Device_Master/records', {
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
