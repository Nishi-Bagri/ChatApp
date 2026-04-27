const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "/accounts/login/";
}

const socket = new WebSocket(
    `ws://127.0.0.1:8000/ws/chat/${conversationId}/?token=${token}`
);

const BASE_URL = "http://127.0.0.1:8000/api/chat";

let currentConversation = null;
let socket = null;

function getCurrentUserId() {
    return parseInt(localStorage.getItem("user_id"));
}

/* =========================
   LOAD CONVERSATIONS
========================= */

async function loadConversations() {
    const res = await fetch(`${BASE_URL}/conversations/`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();

    const list = document.getElementById("conversationList");
    list.innerHTML = "";

    data.forEach(conv => {
        const div = document.createElement("div");
        div.className = "conversation";

        // ✅ FIXED: safe participant handling
        let otherUser = null;

        if (conv.participants && conv.participants.length > 0) {
            otherUser = conv.participants.find(
                u => u.id !== getCurrentUserId()
            );
        }

        // ✅ CLEAN DISPLAY LOGIC
        if (otherUser) {
            div.innerText = otherUser.username;
        } else if (conv.participants && conv.participants.length > 0) {
            // fallback for group chat or self chat
            div.innerText = conv.participants
                .map(u => u.username)
                .join(", ");
        } else {
            div.innerText = "Unknown chat";
        }

        div.onclick = () => {
            currentConversation = conv.id;
            loadMessages(conv.id);
        };

        list.appendChild(div);
    });

    // ✅ auto open first chat only if none selected
    if (data.length > 0 && !currentConversation) {
        currentConversation = data[0].id;
        loadMessages(data[0].id);
    }
}

/* =========================
   LOAD MESSAGES (FIXED)
========================= */

async function loadMessages(conversationId) {
    const res = await fetch(`${BASE_URL}/messages/?conversation=${conversationId}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();

    const box = document.getElementById("messageBox");
    box.innerHTML = "";

     // ✅ SHOW input box
    document.getElementById("chatInput").style.display = "flex";

    data.forEach(msg => {
        const div = document.createElement("div");

        div.className = "msg " + (msg.is_mine ? "me" : "other");
        div.innerText = msg.text;

        box.appendChild(div);
    });

    // 🔥 CONNECT WEBSOCKET HERE
    connectSocket(conversationId);
}

// =========================
// WEBSOCKET CONNECTION
// =========================

function connectSocket(conversationId) {
    if (socket) {
        socket.close();
    }

    socket = new WebSocket(
        `ws://127.0.0.1:8000/ws/chat/${conversationId}/`
    );

    socket.onopen = function () {
        console.log("WebSocket connected");
    };

    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);

        const box = document.getElementById("messageBox");

        const div = document.createElement("div");
        div.className = "msg other";
        div.innerText = data.message;

        box.appendChild(div);

        box.scrollTop = box.scrollHeight;
    };

    socket.onclose = function () {
        console.log("WebSocket closed");
    };
}

// =========================
// SEND MESSAGE (WEBSOCKET)
// =========================

function sendMessage() {
    const input = document.getElementById("messageInput");
    const text = input.value.trim();

    if (!text) return;

    if (!currentConversation) {
        alert("Select a conversation first");
        return;
    }

    // send via websocket (REAL TIME)
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            message: text
        }));
    }

    input.value = "";
}

/* =========================
   INIT
========================= */

loadConversations();


/* =========================
   USER LIST
========================= */

async function loadUsers() {
    const res = await fetch("http://127.0.0.1:8000/api/accounts/users/", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const users = await res.json();

    const list = document.getElementById("userList");
    list.innerHTML = "";

    users.forEach(user => {
        const div = document.createElement("div");
        div.className = "conversation";
        div.innerText = "👤 " + user.username;

        div.onclick = () => {
            startConversation(user.id);
        };

        list.appendChild(div);
    });
}

/* =========================
   TOGGLE USER LIST
========================= */

async function toggleUserList() {
    const res = await fetch(
        "http://127.0.0.1:8000/api/accounts/users/",
        {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    const users = await res.json();

    const box = document.getElementById("messageBox");

    document.getElementById("chatInput").style.display = "none";

    box.innerHTML = "<h3>Select a user to start chat</h3>";

    users
        .filter(user => user.id !== getCurrentUserId())
        .forEach(user => {
            const div = document.createElement("div");
            div.className = "conversation";
            div.innerText = "👤 " + user.username;

            div.onclick = () => startConversation(user.id);

            box.appendChild(div);
        });
}


/* =========================
   START CONVERSATION
========================= */

async function startConversation(userId) {
    const res = await fetch(`${BASE_URL}/conversations/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            participant_id: userId
        })
    });

    const data = await res.json();

    // 🔥 Open chat instantly
    currentConversation = data.id;
    loadMessages(data.id);

    // refresh conversations
    loadConversations();

    // hide user list
    // document.getElementById("userList").style.display = "none";
}