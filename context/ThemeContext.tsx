import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@lawai_theme_mode';

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  theme: typeof lightTheme;
}

const lightTheme = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  navBar: '#FFFFFF',
  navBarBorder: '#E2E8F0',
  cardBackground: '#FFFFFF',
  inputBackground: '#FFFFFF',
  inputBorder: '#E2E8F0',
  badge: '#F1F5F9',
};

const darkTheme: typeof lightTheme = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceMuted: '#0F172A',
  border: '#334155',
  textPrimary: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  navBar: '#1E293B',
  navBarBorder: '#334155',
  cardBackground: '#1E293B',
  inputBackground: '#1E293B',
  inputBorder: '#334155',
  badge: '#0F172A',
};

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
  theme: lightTheme,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme: isDark ? darkTheme : lightTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export { lightTheme, darkTheme };
