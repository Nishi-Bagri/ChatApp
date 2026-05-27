import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, LogOut, MessageCircle } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-primary)" }}>
      <div className="absolute top-4 right-4 flex gap-2">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        <div className="card p-8 text-center">
          {/* Avatar */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{ background: "var(--brand)" }}>
            <span className="text-3xl font-bold text-white">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </span>
          </div>

          <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{user?.username}</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>User ID: {user?.user_id}</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Username</span>
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{user?.username}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>User ID</span>
              <span className="text-sm font-mono font-semibold" style={{ color: "var(--text-primary)" }}>#{user?.user_id}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => navigate("/")} className="btn-ghost flex-1 flex items-center justify-center gap-2">
              <MessageCircle size={14} /> Chats
            </button>
            <button onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold text-red-500 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
