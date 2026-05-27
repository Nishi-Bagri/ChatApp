import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Plus, Search, User, Bell } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState(0);
  const [showUsers, setShowUsers] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchAll = async () => {
    try {
      const [convRes, unreadRes] = await Promise.all([
        api.get("/chat/conversations/"),
        api.get("/chat/unread-count/"),
      ]);
      setConversations(convRes.data);
      setUnread(unreadRes.data.unread);
    } catch {
      logout(); navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/accounts/users/");
      setUsers(data.filter(u => u.id !== user.user_id));
      setShowUsers(true);
    } catch {}
  };

  const startConversation = async (userId) => {
    try {
      const { data } = await api.post("/chat/conversations/", { participant_id: userId });
      setShowUsers(false);
      navigate(`/chat/${data.id}`);
    } catch {}
  };

  useEffect(() => { fetchAll(); }, []);

  const getOther = (conv) => conv.participants?.find(p => p.id !== user?.user_id);

  const filtered = conversations.filter(c => {
    const other = getOther(c);
    return other?.username?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--brand)" }}>
              <MessageCircle size={16} color="white" />
            </div>
            <h1 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Messages</h1>
            {unread > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "var(--brand)" }}>
                {unread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate("/profile")} className="btn-ghost p-2"><User size={15} /></button>
            <ThemeToggle />
            <button onClick={fetchUsers} className="btn-ghost p-2" title="New Chat"><Plus size={15} /></button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-8 text-sm" placeholder="Search conversations…" />
        </div>
      </div>

      {/* User picker modal */}
      {showUsers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="card w-full max-w-xs p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Start New Chat</h3>
              <button onClick={() => setShowUsers(false)} className="btn-ghost px-2 py-1 text-xs">✕</button>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {users.map(u => (
                <button key={u.id} onClick={() => startConversation(u.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:scale-[1.01]"
                  style={{ background: "var(--bg-tertiary)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: "var(--brand)" }}>
                    {u.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{u.username}</span>
                </button>
              ))}
              {users.length === 0 && <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>No other users found</p>}
            </div>
          </div>
        </div>
      )}

      {/* Conversation list */}
      <div className="flex-1 p-4 space-y-1">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
              <div className="w-11 h-11 rounded-full flex-shrink-0" style={{ background: "var(--bg-tertiary)" }} />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded w-1/3" style={{ background: "var(--bg-tertiary)" }} />
                <div className="h-2.5 rounded w-1/2" style={{ background: "var(--bg-tertiary)" }} />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageCircle size={40} style={{ color: "var(--text-muted)" }} className="mb-3" />
            <p className="font-semibold text-sm" style={{ color: "var(--text-secondary)" }}>No conversations yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Tap + to start a new chat</p>
          </div>
        ) : (
          filtered.map(conv => {
            const other = getOther(conv);
            return (
              <button key={conv.id} onClick={() => navigate(`/chat/${conv.id}`)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
                  style={{ background: "var(--brand)" }}>
                  {other?.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {other?.username || "Unknown"}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Tap to open conversation
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
