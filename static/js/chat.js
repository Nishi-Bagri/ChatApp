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

       
        let otherUser = null;

        if (conv.participants && conv.participants.length > 0) {
            otherUser = conv.participants.find(
                u => u.id !== getCurrentUserId()
            );
        }

       
        if (otherUser?.username) {
            div.innerText = otherUser.username;

        } else if (conv.participants?.length > 0) {
            
            div.innerText = conv.participants
                .filter(u => u && u.username)
                .map(u => u.username)
                .join(", ") || "Unknown chat";
        } else {
            div.innerText = "Unknown chat";
        }

        const id = conv.id || conv.conversation_id;   

        div.onclick = () => {
            if (!id) return; 

            currentConversation = id;
            loadMessages(id);
        };

        list.appendChild(div);
    });

     if (!currentConversation) {
        document.getElementById("messageBox").innerHTML =
            "<div class='empty'>Select a conversation to start chatting</div>";

        document.getElementById("chatInput").style.display = "none";
    }

    // ✅ auto open first chat only if none selected
    // if (data.length > 0 && !currentConversation) {
    //     const id = data[0].id || data[0].conversation_id;

    //     currentConversation = id;
    //     loadMessages(id);
    // }
}

/* =========================
   LOAD MESSAGES (FIXED)
========================= */

async function loadMessages(conversationId) {

   console.log("loadMessages called with:", conversationId);

    if (!conversationId) {

        return;
    }

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
    console.trace("connectSocket called with:", conversationId);
    console.log("Connecting to conversation:", conversationId);  // 👈 ADD THIS
    
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

        console.log("WS MESSAGE:", data);

        const box = document.getElementById("messageBox");

        const div = document.createElement("div");
        div.className = "msg other";

        div.innerText = data.message;

        box.appendChild(div);
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

    const data = await res.json();  //

    const users = data.results || data;

    const list = document.getElementById("userList");
    list.innerHTML = "";

    users.forEach(user => {
        if (!user || !user.username) return;


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
    const userList = document.getElementById("userList");

    // toggle visibility
    if (userList.style.display === "none") {
        userList.style.display = "block";
    } else {
        userList.style.display = "none";
        return;
    }

    const res = await fetch(
        "http://127.0.0.1:8000/api/accounts/users/",
        {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    

    const users = await res.json();

    userList.innerHTML = "";

    users
        .filter(user => user.id !== getCurrentUserId())
        .forEach(user => {
            const div = document.createElement("div");
            div.className = "conversation";
            div.innerText = "👤 " + user.username;

            div.onclick = () => startConversation(user.id);

            userList.appendChild(div);
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

    const id = data.id || data.conversation_id;

    if (!id) {
        console.error("Invalid conversation response:", data);
        return;
    }

    currentConversation = id; 

    loadMessages(id);
    loadConversations();

    // ✅ hide user list after click
    document.getElementById("userList").style.display = "none";
}

function logout() {
    console.log("logout clicked");

    localStorage.clear();
    window.location.href = "/accounts/register/";
}

document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("logoutBtn");

    if (btn) {
        btn.addEventListener("click", logout);
    }
});