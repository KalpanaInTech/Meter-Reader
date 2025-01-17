// Base URL of your PocketHost instance
const BASE_URL = "http://127.0.0.1:8090";

// Function to handle user login
async function handleLogin(event) {
    event.preventDefault();

    const userName = document.getElementById("userName").value;
    const password = document.getElementById("password").value;
    const feedbackMessage = document.getElementById("loginFeedback");

    feedbackMessage.textContent = ""; // Clear previous feedback

    if (!userName || !password) {
        feedbackMessage.textContent = "Please fill in all fields.";
        feedbackMessage.className = "error-message";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/collections/App_Users/records`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user data.");
        }

        const data = await response.json();

        // Check if the username exists
        const user = data.items.find(user => user.user_name === userName);
        if (!user) {
            feedbackMessage.textContent = "Invalid username or password.";
            feedbackMessage.className = "error-message";
            return;
        }

        // Verify the password
        if (user.password !== password) {
            feedbackMessage.textContent = "Invalid username or password.";
            feedbackMessage.className = "error-message";
            return;
        }

        // Store user data in sessionStorage
        sessionStorage.setItem("loggedInUser", JSON.stringify(user));

        // Successful login
        feedbackMessage.textContent = "Login successful!";
        feedbackMessage.className = "success-message";
         // Redirect to home page
        setTimeout(() => {
            window.location.href = "Home.html";
        }, 1000);

    } catch (error) {
        console.error("Error during login:", error);
        feedbackMessage.textContent = "An error occurred. Please try again.";
        feedbackMessage.className = "error-message";
    }
}

// Attach the login handler to the form submission
document.getElementById("loginForm").addEventListener("submit", handleLogin);
