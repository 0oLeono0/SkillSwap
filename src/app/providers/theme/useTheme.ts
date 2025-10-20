import { useContext } from 'react';
import { ThemeContext, type ThemeContextType } from './ThemeProvider';

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
};