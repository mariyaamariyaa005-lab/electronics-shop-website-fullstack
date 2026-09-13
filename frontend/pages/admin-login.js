const API_BASE_URL = "http://localhost:8080";

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");

// If already logged in, skip straight to the admin panel
if (sessionStorage.getItem("smaAdminAuth")) {
    window.location.href = "./admin.html";
}

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Basic auth credentials are just "username:password" base64-encoded
    const encodedCredentials = btoa(`${username}:${password}`);

    try {

        const response = await fetch(`${API_BASE_URL}/api/admin/check`, {
            headers: {
                "Authorization": `Basic ${encodedCredentials}`
            }
        });

        if (response.status === 401) {
            loginMessage.textContent = "Incorrect username or password.";
            loginMessage.className = "form-message error";
            return;
        }

        if (!response.ok) {
            throw new Error("Server responded with " + response.status);
        }

        // Credentials are valid — store them for this browser tab session only
        sessionStorage.setItem("smaAdminAuth", encodedCredentials);
        window.location.href = "./admin.html";

    } catch (error) {

        console.error("Login failed:", error);
        loginMessage.textContent = "Couldn't reach the server. Is the backend running?";
        loginMessage.className = "form-message error";

    }

});
