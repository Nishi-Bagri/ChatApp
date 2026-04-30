console.log("CHAT JS LOADED");

// ✅ FIX #2: Don't read token once at top level — read fresh in each function
// const token = localStorage.getItem("token"); ← REMOVED

if (!localStorage.getItem("token")) {
    window.location.href = "/accounts/login/";
}

const BASE_URL = "http://127.0.0.1:8000/api/chat";

let currentConversation = null;
let socket = null;

function getCurrentUserId() {
    return parseInt(localStorage.getItem("user_id"));
}

/* =========================
   USER LIST
========================= */

async function loadUsers() {
    const token = localStorage.getItem("token"); // ✅ FIX #2: read fresh

    try {
        const res = await fetch("http://127.0.0.1:8000/api/accounts/users/", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        // ✅ FIX #4: error handling
        if (!res.ok) {
            console.error("Failed to load users:", res.status);
            return;
        }

        const users = await res.json();
        const list = document.getElementById("userList");
        list.innerHTML = "";

        users
            .filter(user => user.id !== getCurrentUserId())
            .forEach(user => {
                const div = document.createElement("div");
                div.className = "conversation";
                div.innerText = user.username;
                div.onclick = () => startConversation(user.id);
                list.appendChild(div);
            });

    } catch (err) {
        console.error("loadUsers error:", err);
    }
}

/* =========================
   LOAD MESSAGES
========================= */

async function loadMessages(conversationId) {
    console.log("loadMessages called with:", conversationId);

    if (!conversationId) return;

    const token = localStorage.getItem("token"); // ✅ FIX #2: read fresh

    try {
        const res = await fetch(`${BASE_URL}/messages/?conversation_id=${conversationId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        // ✅ FIX #4: error handling
        if (!res.ok) {
            console.error("Failed to load messages:", res.status);
            return;
        }

        const data = await res.json();
        const box = document.getElementById("messageBox");
        box.innerHTML = "";

        document.getElementById("chatInput").style.display = "flex";

        // ✅ FIX #7: empty state
        if (data.length === 0) {
            box.innerHTML = `<p style="text-align:center; color:#aaa; margin-top: 40px;">No messages yet. Say hi! 👋</p>`;
        } else {
            data.forEach(msg => {
                const div = document.createElement("div");
                div.className = "msg " + (msg.is_mine ? "me" : "other");
                div.innerText = msg.text;
                box.appendChild(div);
            });
        }

        box.scrollTop = box.scrollHeight;

        // ✅ FIX #3: connectSocket removed from here — called separately in startConversation

    } catch (err) {
        console.error("loadMessages error:", err);
    }
}

/* =========================
   WEBSOCKET CONNECTION
========================= */

function connectSocket(conversationId) {
    const token = localStorage.getItem("token"); // ✅ FIX #2: read fresh

    if (socket) {
        socket.close();
        socket = null;
    }

    socket = new WebSocket(
        `ws://127.0.0.1:8000/ws/chat/${conversationId}/?token=${token}`
    );

    socket.onopen = function () {
        console.log("WebSocket connected");
    };

    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        const currentUsername = localStorage.getItem("username");
        

        console.log("data.username:", data.username);
        console.log("localStorage username:", currentUsername);
        console.log("Match?", data.username === currentUsername);
        // ✅ FIX #SendMsg: now works because username is sent in socket.send()
        if (data.username === currentUsername) return;

        const box = document.getElementById("messageBox");

        // Remove empty state placeholder if present
        const placeholder = box.querySelector("p");
        if (placeholder) placeholder.remove();

        const div = document.createElement("div");
        div.className = "msg other";
        div.innerText = data.message;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    };

    socket.onclose = function () {
        console.log("WebSocket closed");
        // ✅ FIX #5: auto-reconnect after 3 seconds if we still have a conversation open
        if (currentConversation) {
            console.log("Reconnecting in 3s...");
            setTimeout(() => connectSocket(currentConversation), 3000);
        }
    };

    socket.onerror = function (err) {
        console.error("WebSocket error:", err);
    };
}

/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {
    const input = document.getElementById("messageInput");
    const text = input.value.trim();

    if (!text || !currentConversation) return;

    const token = localStorage.getItem("token"); // ✅ FIX #2: read fresh
    const username = localStorage.getItem("username");

    // ✅ FIX: Add sender's message to UI immediately (optimistic update)
    const box = document.getElementById("messageBox");

    // Remove empty state placeholder if present
    const placeholder = box.querySelector("p");
    if (placeholder) placeholder.remove();

    const div = document.createElement("div");
    div.className = "msg me";
    div.innerText = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;

    input.value = "";

    try {
        await fetch(`${BASE_URL}/messages/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                text: text,
                conversation_id: currentConversation
            })
        });

        // ✅ FIX #SendMsg: include username so onmessage filter can skip sender's echo
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                message: text,
                username: username  // ✅ KEY FIX — was missing before
            }));
        }

    } catch (err) {
        console.error("sendMessage error:", err);
        // Optionally mark the message as failed in UI here
    }
}

/* =========================
   START CONVERSATION
========================= */

async function startConversation(userId) {
    console.log("START CONVO with:", userId);

    const token = localStorage.getItem("token"); // ✅ FIX #2: read fresh

    try {
        const res = await fetch(`${BASE_URL}/conversations/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ participant_id: userId })
        });

        // ✅ FIX #4: error handling
        if (!res.ok) {
            console.error("Failed to start conversation:", res.status);
            return;
        }

        const data = await res.json();
        const id = data.id || data.conversation_id;

        console.log("Conversation ID:", id);

        if (!id) {
            console.error("Invalid conversation response:", data);
            return;
        }

        currentConversation = id;

        await loadMessages(id);    // ✅ FIX #3: only loads history
        connectSocket(id);         // ✅ FIX #3: socket connected separately here

    } catch (err) {
        console.error("startConversation error:", err);
    }
}

/* =========================
   LOGOUT
========================= */

function logout() {
    // ✅ FIX #1: remove the correct keys that are actually stored
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");

    // Close socket cleanly on logout
    if (socket) {
        socket.close();
        socket = null;
    }

    window.location.replace("/login/");
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", function () {
    loadUsers();

    const btn = document.getElementById("logoutBtn");
    if (btn) {
        btn.addEventListener("click", logout);
    }

    // ✅ FIX #6: send on Enter key
    const messageInput = document.getElementById("messageInput");
    if (messageInput) {
        messageInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

