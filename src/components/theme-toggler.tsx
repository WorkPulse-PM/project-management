import { useTheme } from '@/components/theme-provider';
import { Switch } from './ui/switch';
import { MoonIcon, SunIcon } from 'lucide-react';

export function ThemeToggler() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isDark}
        onCheckedChange={() => setTheme(isDark ? 'light' : 'dark')}
      />
      {theme === 'dark' && (
        <span className="font-semibold flex items-center gap-1">
          <span>Dark Mode</span>
          <MoonIcon size={16} />
        </span>
      )}
      {theme === 'light' && (
        <span className="font-medium flex items-center gap-1">
          <span>Light Mode</span>
          <SunIcon size={16} />
        </span>
      )}
    </div>
  );
}
