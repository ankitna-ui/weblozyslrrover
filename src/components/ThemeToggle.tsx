import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import FullScreenLoader from './loaders/FullScreenLoader';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleToggle = () => {
    setIsSwitching(true);
    // Add brief artificial delay to simulate heavy re-render logic
    setTimeout(() => {
      setTheme(theme === 'dark' ? 'light' : 'dark');
      setTimeout(() => setIsSwitching(false), 200); // Give the theme time to apply
    }, 400);
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className="p-2 rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
        aria-label="Toggle theme"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
        <Moon className="absolute top-[0.5rem] h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-400" />
        <span className="sr-only">Toggle theme</span>
      </button>
      {isSwitching && <FullScreenLoader />}
    </>
  );
}
