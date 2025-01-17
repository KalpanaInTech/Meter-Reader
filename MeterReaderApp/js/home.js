// Base URL of your PocketHost instance
const BASE_URL = "http://127.0.0.1:8090";

// Function to set up the home page based on user role
async function setupHomePage() {
    const welcomeMessage = document.getElementById("welcomeMessage");
    const addDeviceButton = document.getElementById("addDeviceButton");
    const addDeviceRecordButton = document.getElementById("deviceReadingButton");
    const uploadDataButton = document.getElementById("csvUploadButton");
    // Fetch user data from sessionStorage (set after login)
    const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        // Redirect to login page if no user is logged in
        window.location.href = "login.html";
        return;
    }

    // Display welcome message
    welcomeMessage.textContent = `Hello, ${loggedInUser.user_name}!`;

    // Show admin-specific buttons if role is 'admin'
    if (loggedInUser.role === "admin") {
        addDeviceButton.classList.remove("hidden");
        addDeviceRecordButton.classList.remove("hidden");
        uploadDataButton.classList.remove("hidden");
    }
}

// Initialize the page
document.addEventListener("DOMContentLoaded", setupHomePage);
