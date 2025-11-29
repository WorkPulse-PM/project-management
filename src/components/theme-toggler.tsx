import { useTheme } from '@/components/theme-provider';
import { Switch } from './ui/switch';
import { MoonIcon, SunIcon } from 'lucide-react';

export function ThemeToggler() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <div className="flex items-center justify-between w-full gap-2 ">
      {theme === 'dark' && (
        <span className="flex items-center gap-1 font-semibold">
          <MoonIcon size={16} />
          <span>Dark Mode</span>
        </span>
      )}
      {theme === 'light' && (
        <span className="flex items-center gap-1 font-medium">
          <SunIcon size={16} />
          <span>Light Mode</span>
        </span>
      )}
      <Switch
        checked={isDark}
        onCheckedChange={() => setTheme(isDark ? 'light' : 'dark')}
      />
    </div>
  );
}
