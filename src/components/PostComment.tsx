import Giscus, { type Theme } from '@giscus/react';
import { GISCUS } from '@/constants';

import { useEffect, useState } from 'react';

interface CommentsProps {
  lightTheme?: Theme;
  darkTheme?: Theme;
}

export default function Comments({
  lightTheme = 'light',
  darkTheme = 'dark',
}: CommentsProps) {
  const [theme, setTheme] = useState(() => {
    const currentTheme = localStorage.getItem('theme');
    const browserTheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light';

    return currentTheme || browserTheme;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="mt-8">
      <Giscus theme={theme === 'light' ? lightTheme : darkTheme} {...GISCUS} />
    </div>
  );
}
