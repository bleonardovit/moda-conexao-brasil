
import * as React from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      try {
        // Check for stored preference or system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          return savedTheme as Theme;
        }
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      } catch (e) {
        console.error('Error accessing localStorage:', e);
      }
    }
    return 'light'; // Default to light if no preference or not in browser
  });

  React.useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    try {
      // Update DOM and localStorage when theme changes
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error('Error updating theme:', e);
    }
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme]);

  const value = React.useMemo(() => ({
    theme,
    toggleTheme,
    setTheme
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
