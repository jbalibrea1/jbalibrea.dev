import Giscus, { type Theme } from '@giscus/react';
import { GISCUS } from '@/constants';

import { useEffect, useState } from 'react';

interface CommentsProps {
  lightTheme?: Theme;
  darkTheme?: Theme;
}

// La clase `dark` de <html> la fija el script del <head> (BaseLayout)
const currentTheme = () =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light';

export default function Comments({
  lightTheme = 'light',
  darkTheme = 'dark',
}: CommentsProps) {
  // Solo se renderiza en cliente (client:only), así que `document` existe
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(currentTheme()));
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
