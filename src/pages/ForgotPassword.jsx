import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound } from "lucide-react";
import api from "../api/axios";
import ThemeToggle from "../components/ThemeToggle";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(""); setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/accounts/reset-password/", {
        username,
        new_password: newPassword,
      });
      setMsg(data.message || "Password reset successful!");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-primary)" }}>
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "var(--brand)" }}>
            <KeyRound size={26} color="white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Reset Password</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Enter your username and new password</p>
        </div>

        <div className="card p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)}
                className="input-field" placeholder="your_username" autoFocus required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="input-field" placeholder="••••••••" required />
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
            {msg && <p className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">{msg}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Resetting…" : "Reset Password"}
            </button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
            <Link to="/login" className="font-semibold hover:underline" style={{ color: "var(--brand)" }}>← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
