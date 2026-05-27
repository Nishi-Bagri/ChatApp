import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import ThemeToggle from "../components/ThemeToggle";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      await api.post("/accounts/register/", form);
      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.username?.[0] || data?.email?.[0] || "Registration failed");
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
            <UserPlus size={26} color="white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Create account</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Start chatting in seconds</p>
        </div>

        <div className="card p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Username</label>
              <input name="username" value={form.username} onChange={handle}
                className="input-field" placeholder="cool_username" autoFocus required />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                className="input-field" placeholder="you@email.com" required />
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

            {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
            {success && <p className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">{success}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating…" : "Create Account"}
            </button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: "var(--brand)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
