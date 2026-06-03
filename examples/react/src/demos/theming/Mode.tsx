import { Button, useTheme } from '@doranjs/ui';

// <ThemeProvider> exposes the current light/dark mode and a toggle through the
// useTheme() hook. Wrap your app once, then read/flip the mode anywhere.
export default function Mode() {
  const { mode, toggleMode } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Button onClick={toggleMode}>{mode === 'light' ? '🌙 تیره' : '☀️ روشن'}</Button>
      <span className="result">حالت فعلی: {mode === 'light' ? 'روشن' : 'تیره'}</span>
    </div>
  );
}
