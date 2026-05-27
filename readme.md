# 💬 Chat App — Django Channels + WebSocket + Redis

A real-time chat application built with **Django Channels**, **WebSockets**, and **Redis**, featuring JWT-based authentication, REST API for conversations/messages, and an unread message counter.

---

## 🚀 Features

- ✅ Real-time messaging via WebSocket (Django Channels)
- ✅ JWT Authentication for WebSocket connections (token in query params)
- ✅ REST API for Conversations & Messages
- ✅ One-to-one Conversation support
- ✅ Unread message count endpoint
- ✅ User Registration & Login (JWT)
- ✅ Password Reset flow (token-based)
- ✅ Redis as Channel Layer (pub/sub)
- ✅ Daphne ASGI server
- ✅ Django Template views for chat UI

---

## 🗂️ Project Structure

```
CHAT_PROJECT/
├── apps/
│   ├── accounts/                   # User auth app
│   │   ├── models.py
│   │   ├── views.py                # Register, Login, Password Reset
│   │   ├── serializers.py
│   │   ├── urls.py                 # Template routes
│   │   ├── api_urls.py             # API routes
│   │   └── template_views.py      # HTML page views
│   └── chat/                       # Chat app
│       ├── models.py               # Conversation, Message
│       ├── consumers.py            # WebSocket ChatConsumer
│       ├── middleware.py           # JWT Auth Middleware for WebSocket
│       ├── routing.py              # WebSocket URL routing
│       ├── views.py                # Conversation, Message, UnreadCount API
│       ├── serializers.py
│       ├── urls.py                 # Template routes
│       ├── api_urls.py             # API routes
│       └── template_views.py      # HTML page views
├── chat_project/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py                     # ASGI + Channels config
│   └── wsgi.py
├── templates/
│   ├── accounts/
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── password_reset.html
│   │   ├── password_reset_done.html
│   │   ├── password_reset_confirm.html
│   │   └── password_reset_complete.html
│   └── chat/
│       ├── chat.html
│       ├── conversations.html
│       └── messages.html
├── static/
├── .gitignore
├── manage.py
└── requirements.txt
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Python 3.12+
- Redis server running on `localhost:6379`

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chat_project.git
cd chat_project
```

---

### 2. Create & Activate Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
```

---

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Start Redis Server

```bash
# Windows (via WSL or Redis installer)
redis-server

# Linux/Mac
sudo service redis start
```

Redis must be running on `127.0.0.1:6379` before starting Django.

---

### 5. Apply Migrations

```bash
python manage.py migrate
```

---

### 6. Run Development Server

```bash
python manage.py runserver
```

Server runs at: `http://127.0.0.1:8000`
WebSocket runs at: `ws://127.0.0.1:8000/ws/chat/<room_id>/`

---

## 📡 API Endpoints

### Accounts — Base: `/api/accounts/`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `register/` | Register new user | No |
| POST | `login/` | Login → returns JWT tokens + username + user_id | No |
| POST | `token/refresh/` | Refresh access token | No |
| GET | `users/` | List all users | Yes |
| POST | `reset-password/` | Reset password by username | No |

### Chat — Base: `/api/chat/`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `conversations/` | List user's conversations | Yes |
| POST | `conversations/` | Create or get existing conversation | Yes |
| GET | `messages/?conversation_id=<id>` | List messages in a conversation | Yes |
| POST | `messages/` | Send a new message | Yes |
| GET | `unread-count/` | Get unread message count | Yes |

### Template Pages — Base: `/chat/`

| URL | Page |
|-----|------|
| `/chat/` | Main chat page |
| `/chat/conversations/` | Conversations list |
| `/chat/<id>/messages/` | Messages in a conversation |

### Accounts Template Pages — Base: `/accounts/`

| URL | Page |
|-----|------|
| `/accounts/register/` | Register page |
| `/accounts/password-reset/` | Password reset request |
| `/accounts/password-reset/done/` | Reset email sent confirmation |
| `/accounts/password-reset/confirm/<uidb64>/<token>/` | Reset confirm page |
| `/accounts/password-reset/complete/` | Reset complete page |

---

## 🗃️ Database Models

### `Conversation`

| Field | Type | Description |
|-------|------|-------------|
| `participants` | ManyToManyField → User | Users in the conversation |
| `created_at` | DateTimeField | When conversation started |

### `Message`

| Field | Type | Description |
|-------|------|-------------|
| `conversation` | FK → Conversation | Parent conversation |
| `sender` | FK → User | Message sender |
| `text` | TextField | Message content |
| `timestamp` | DateTimeField | Sent time |
| `is_read` | BooleanField | Read status |

---

## 🔌 WebSocket — Real-time Chat

### Connect

```
ws://127.0.0.1:8000/ws/chat/<room_id>/?token=<jwt_access_token>
```

JWT token passed as query param — authenticated via `JWTAuthMiddleware`.

### Send Message

```json
{ "message": "Hello!" }
```

### Receive Message

```json
{
  "message": "Hello!",
  "username": "abhishek"
}
```

### How It Works

```
Client connects to ws/chat/<room_id>/?token=<jwt>
        ↓
JWTAuthMiddleware validates token → sets scope["user"]
        ↓
ChatConsumer.connect() → joins channel group "chat_<room_id>"
        ↓
ChatConsumer.receive() → group_send to all in room
        ↓
ChatConsumer.chat_message() → sends to each connected client
        ↓
Redis (Channel Layer) handles pub/sub between consumers
```

---

## 🔄 Auth Flows

### Register & Login

```
POST /api/accounts/register/  → User created
        ↓
POST /api/accounts/login/     → Returns access + refresh token + username + user_id
        ↓
Use access token in:
  - REST API: Authorization: Bearer <token>
  - WebSocket: ws://.../?token=<token>
```

### Create Conversation & Chat

```
POST /api/chat/conversations/  { "participant_id": <user_id> }
        ↓
Returns existing or new conversation with id
        ↓
Connect WebSocket: ws/chat/<conversation_id>/?token=<jwt>
        ↓
Send & receive messages in real-time
```

---

## 🔑 JWT Configuration

| Setting | Value |
|---------|-------|
| Access Token Lifetime | 1 hour |
| Refresh Token Lifetime | 7 days |
| Auth Header (REST) | `Bearer <token>` |
| Auth (WebSocket) | `?token=<token>` query param |

---

## 🧰 Tech Stack

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| Django | 6.0.4 | Web framework |
| djangorestframework | 3.17.1 | REST API |
| channels | 4.3.2 | WebSocket support |
| channels_redis | 4.3.0 | Redis channel layer |
| daphne | 4.2.1 | ASGI server |
| djangorestframework-simplejwt | 5.5.1 | JWT authentication |
| redis | 7.4.0 | Message broker |
| Twisted | 25.5.0 | Async networking |

---

## 🛡️ Security Notes

- JWT token validated on every WebSocket connection via `JWTAuthMiddleware`
- Anonymous users cannot send/receive messages
- Users can only access their own conversations and messages
- Password reset uses Django's built-in token generator

> ⚠️ Move `SECRET_KEY` to `.env` before pushing to GitHub

---

## 👨‍💻 Author

**Nishi**  
Built with Django Channels + Redis + DRF — May 2026

---

## 📄 License

This project is for educational/personal use. Feel free to fork and modify.
