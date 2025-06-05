// Detecta el tipo de ruta actual
export function detectRoute(path: string) {
  const cleanPath = path.replace(/^\/|\/$|\?.*$/g, '').toLowerCase();

  return {
    isHome: cleanPath === '',
    isBlog: cleanPath.startsWith('blog'),
    isContact: cleanPath.startsWith('contact'),
    isRepositories: cleanPath.startsWith('repositories'),
    rawPath: cleanPath,
  };
}
