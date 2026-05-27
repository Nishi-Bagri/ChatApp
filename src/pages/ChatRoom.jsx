import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const WS_BASE = "ws://192.168.1.83:8000";

export default function ChatRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  // Load previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/chat/messages/?conversation_id=${id}`);
        setMessages(data.map(m => ({
          text: m.text,
          username: m.sender_name || (m.sender === user.user_id ? user.username : "other"),
          fromMe: m.sender === user.user_id,
          id: m.id,
        })));
      } catch {}
    };

    const fetchConv = async () => {
      try {
        const { data } = await api.get("/chat/conversations/");
        const conv = data.find(c => String(c.id) === String(id));
        if (conv) {
          const other = conv.participants?.find(p => p.id !== user?.user_id);
          setOtherUser(other);
        }
      } catch {}
    };

    fetchMessages();
    fetchConv();
  }, [id]);

  // WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem("access");
    const ws = new WebSocket(`${WS_BASE}/ws/chat/${id}/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages(prev => [...prev, {
        text: data.message,
        username: data.username,
        fromMe: data.username === user.username,
        id: Date.now(),
      }]);
    };

    return () => ws.close();
  }, [id]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ message: text.trim() }));
    api.post("/chat/messages/", { conversation_id: id, text: text.trim() }).catch(() => {});
    setText("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => navigate("/")} className="btn-ghost p-2">
          <ArrowLeft size={16} />
        </button>

        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: "var(--brand)" }}>
          {otherUser?.username?.[0]?.toUpperCase() || "?"}
        </div>

        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            {otherUser?.username || "Chat"}
          </p>
          <p className="text-xs flex items-center gap-1" style={{ color: connected ? "#22c55e" : "var(--text-muted)" }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: connected ? "#22c55e" : "var(--text-muted)" }} />
            {connected ? "Online" : "Connecting…"}
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No messages yet. Say hi! 👋</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={msg.id || i} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"} animate-fade-in`}>
            <div className="max-w-[75%]">
              {!msg.fromMe && (
                <p className="text-xs mb-1 ml-1 font-medium" style={{ color: "var(--text-muted)" }}>{msg.username}</p>
              )}
              <div className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: msg.fromMe ? "var(--msg-sent)" : "var(--msg-recv)",
                  color: msg.fromMe ? "var(--msg-sent-text)" : "var(--msg-recv-text)",
                  borderBottomRightRadius: msg.fromMe ? "4px" : "16px",
                  borderBottomLeftRadius: msg.fromMe ? "16px" : "4px",
                  border: msg.fromMe ? "none" : "1px solid var(--border)",
                }}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 flex-shrink-0"
        style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)" }}>
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            className="input-field flex-1 resize-none max-h-28 text-sm"
            placeholder="Type a message…"
            style={{ lineHeight: "1.5" }}
          />
          <button onClick={sendMessage} disabled={!text.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
            style={{ background: "var(--brand)" }}>
            <Send size={15} color="white" />
          </button>
        </div>
        <p className="text-xs mt-1.5 text-center" style={{ color: "var(--text-muted)" }}>
          Enter to send • Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
