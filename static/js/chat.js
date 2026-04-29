console.log("CHAT JS LOADED");


const token = localStorage.getItem("token");

if (!token) {
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
    const res = await fetch("http://127.0.0.1:8000/api/accounts/users/", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

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
}

/* =========================
   LOAD MESSAGES
========================= */

async function loadMessages(conversationId) {
    console.log("loadMessages called with:", conversationId);

    if (!conversationId) return;

    const res = await fetch(`${BASE_URL}/messages/?conversation_id=${conversationId}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();

    const box = document.getElementById("messageBox");
    box.innerHTML = "";

    document.getElementById("chatInput").style.display = "flex";

    data.forEach(msg => {
        const div = document.createElement("div");
        div.className = "msg " + (msg.is_mine ? "me" : "other");
        div.innerText = msg.text;
        box.appendChild(div);
    });

    box.scrollTop = box.scrollHeight;

    connectSocket(conversationId);
}

/* =========================
   WEBSOCKET CONNECTION
========================= */

function connectSocket(conversationId) {
    const token = localStorage.getItem("token");

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

        if (data.username == currentUsername) return

        const box = document.getElementById("messageBox");

        const div = document.createElement("div");
        div.className = "msg other";
        div.innerText = data.message;

        // addMessageToChatUI(data);
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    };

    socket.onclose = function () {
        console.log("WebSocket closed");
    };
}

/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {
       
        const input = document.getElementById("messageInput");
        const text = input.value.trim();

    
        if (!text || !currentConversation) return;
        

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

    
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ message: text }));
        }
        

        const box = document.getElementById("messageBox");
        const div = document.createElement("div");
        div.className = "msg me";
        div.innerText = text;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;

        input.value = "";
        
    }

/* =========================
   START CONVERSATION
========================= */

async function startConversation(userId) {
    console.log("START CONVO with:", userId); 
    const res = await fetch(`${BASE_URL}/conversations/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ participant_id: userId })
    });

    const data = await res.json();
    const id = data.id || data.conversation_id;

    console.log("Conversation ID:", id);

    if (!id) {
        console.error("Invalid conversation response:", data);
        return;
    }

    currentConversation = id;
    loadMessages(id);
}

/* =========================
   LOGOUT
========================= */

function logout() {
    localStorage.clear();
    window.location.href = "/accounts/register/";
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", function () {
    loadUsers(); // ✅ called after DOM is ready and function is defined

    const btn = document.getElementById("logoutBtn");
    if (btn) {
        btn.addEventListener("click", logout);
    }

    // const sendBtn = document.getElementById("sendBtn");   // ✅ ADD THIS
    // if (sendBtn) {
    //     sendBtn.addEventListener("click", sendMessage);
    // }

});

