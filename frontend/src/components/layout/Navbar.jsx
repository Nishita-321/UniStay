import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar({ onMenuClick, title }) {
  const { dark, toggle } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 lg:px-6 gap-4">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden transition-colors"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
        {title}
      </h1>

      <button
        onClick={toggle}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        {dark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
}
