window.onload = async function () {
    try {
        //https://meterreaderplus.pockethost.io/
        //https://meterreaderce2.pockethost.io
        const response = await fetch('http://127.0.0.1:8090/api/collections/Device_Master/records', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch device details');
        }

        const data = await response.json();
        const deviceTableBody = document.getElementById('deviceTableBody');

        data.items.forEach(device => {
            const row = document.createElement('tr');
            console.log("device.device_id :"+device.device_id); 
            row.innerHTML = `
                <td>${device.device_id}</td>
                <td>${device.device_name}</td>
                <td>${device.device_type}</td>
                <td>${device.device_barcode}</td>
                <td>${device.location}</td>
                <td>${device.installation_date}</td>
                <td>${device.status === "1" ? 'Active' : 'Inactive'}</td>
            `;

            deviceTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching device data:', error);
        alert('Could not load device details. Please try again later.');
    }
};
