import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MessageCircle, Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/accounts/login/", form);
      login(
        { username: data.username, user_id: data.user_id },
        data.access,
        data.refresh
      );
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-primary)" }}>
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "var(--brand)" }}>
            <MessageCircle size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Sign in to continue</p>
        </div>

        <div className="card p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Username</label>
              <input name="username" value={form.username} onChange={handle}
                className="input-field" placeholder="your_username" autoFocus required />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Password</label>
              <div className="relative">
                <input name="password" type={showPass ? "text" : "password"} value={form.password} onChange={handle}
                  className="input-field pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center space-y-2">
            <Link to="/forgot-password" className="text-xs hover:underline" style={{ color: "var(--brand)" }}>
              Forgot password?
            </Link>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: "var(--brand)" }}>Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
