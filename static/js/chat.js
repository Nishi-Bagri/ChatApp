const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "/accounts/login/";
}

/* =========================
   CONFIG
========================= */

const BASE_URL = "http://127.0.0.1:8000/api/chat";
let currentConversation = null;

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
    list.innerHTML = "<h3 style='padding:10px;'>Chats</h3>";

    data.forEach(conv => {
        const div = document.createElement("div");
        div.className = "conversation";
        div.innerText = "Conversation " + conv.id;

        div.onclick = () => {
            currentConversation = conv.id;
            loadMessages(conv.id);
        };

        list.appendChild(div);
    });
}

/* =========================
   LOAD MESSAGES
========================= */

async function loadMessages(conversationId) {
    const res = await fetch(`${BASE_URL}/messages/`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();

    const box = document.getElementById("messageBox");
    box.innerHTML = "";

    const filtered = data.filter(msg => msg.conversation == conversationId);

    filtered.forEach(msg => {
        const div = document.createElement("div");
        div.className = "msg " + (msg.sender == "me" ? "me" : "other");
        div.innerText = msg.text;

        box.appendChild(div);
    });
}

/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {
    const input = document.getElementById("messageInput");
    const text = input.value;

    if (!currentConversation) {
        alert("Select a conversation first");
        return;
    }

    await fetch(`${BASE_URL}/messages/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            text: text,
            conversation: currentConversation
        })
    });

    input.value = "";
    loadMessages(currentConversation);
}

/* =========================
   INIT
========================= */

loadConversations();