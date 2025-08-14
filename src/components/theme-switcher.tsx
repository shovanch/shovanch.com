import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'blue';

type ThemeSwitcherProps = {
  className?: string;
};

export function ThemeSwitcher({ className = '' }: ThemeSwitcherProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark');

  // Initialize theme from localStorage and DOM classes
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      setCurrentTheme(storedTheme);
    } else {
      // Check current DOM classes
      const html = document.documentElement;
      if (html.classList.contains('blue')) {
        setCurrentTheme('blue');
      } else if (html.classList.contains('dark')) {
        setCurrentTheme('dark');
      } else {
        setCurrentTheme('light');
      }
    }
  }, []);

  const setTheme = (theme: Theme): void => {
    const html = document.documentElement;
    // Remove all theme classes
    html.classList.remove('dark', 'blue');

    // Add the appropriate class for non-light themes
    if (theme === 'dark') {
      html.classList.add('dark');
    } else if (theme === 'blue') {
      html.classList.add('blue');
    }

    // Store in localStorage
    localStorage.setItem('theme', theme);
    setCurrentTheme(theme);
  };

  const switchToTheme = (theme: Theme): void => {
    setTheme(theme);
  };

  const getButtonStyle = (theme: Theme) => {
    const isActive = currentTheme === theme;
    const baseClasses =
      'h-5 w-5 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none';

    switch (theme) {
      case 'blue':
        return `${baseClasses} ${isActive ? 'border-white scale-110' : 'border-gray-300'} bg-[#2469d6] focus:ring-[#2469d6]`;
      case 'light':
        return `${baseClasses} ${isActive ? 'border-gray-800 scale-110' : 'border-neutral-500'} bg-[#fef9f6] focus:ring-gray-300`;
      case 'dark':
        return `${baseClasses} ${isActive ? 'border-white scale-110' : 'border-gray-300'} bg-black focus:ring-gray-600`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={`flex items-center gap-4 md:gap-2 ${className}`}>
      <button
        onClick={() => switchToTheme('blue')}
        className={getButtonStyle('blue')}
        aria-label="Switch to blue theme"
      />
      <button
        onClick={() => switchToTheme('light')}
        className={getButtonStyle('light')}
        aria-label="Switch to light theme"
      />
      <button
        onClick={() => switchToTheme('dark')}
        className={getButtonStyle('dark')}
        aria-label="Switch to dark theme"
      />
    </div>
  );
}
