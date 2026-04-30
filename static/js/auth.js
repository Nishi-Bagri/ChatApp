console.log("AUTH JS VERSION 2 LOADED");

const BASE_URL = "http://127.0.0.1:8000/api/accounts";

/* ---------------- LOGIN ---------------- */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");

        try {
            const res = await fetch(`${BASE_URL}/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok && data.access) {
                localStorage.setItem("token", data.access);
                localStorage.setItem("refresh", data.refresh);
                localStorage.setItem("user_id", data.user_id);
                localStorage.setItem("username", data.username);
                message.innerText = "Login successful";
                window.location.href = "/chat/";

                // redirect to chat page (you'll create later)
                // window.location.href = "chat.html";

            } else {
                message.innerText = "Invalid credentials";
            }

        } catch (error) {
            message.innerText = "Error connecting to server";
            console.error(error);
        }
    });
}

/* ---------------- REGISTER ---------------- */
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = document.getElementById("registerUsername").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const message = document.getElementById("registerMessage");

        try {
            const res = await fetch(`${BASE_URL}/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                message.innerText = "Registration successful ✅";

                // optional redirect after register
                setTimeout(() => {
                    window.location.href = "/accounts/login/";
                }, 1500);

            } else {
                message.innerText = JSON.stringify(data);
            }

        } catch (error) {
            message.innerText = "Error connecting to server";
            console.error(error);
        }
    });
}