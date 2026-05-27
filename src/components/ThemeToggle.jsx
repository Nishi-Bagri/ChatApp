import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg btn-ghost"
      title={dark ? "Switch to Light" : "Switch to Dark"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
