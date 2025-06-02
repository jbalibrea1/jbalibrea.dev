export function getCanonicalURL({
  pathname,
  site,
}: {
  pathname: string;
  site: URL | undefined;
}) {
  const cleanPath = pathname.replace(/\/$/, '');
  const segments = cleanPath.split('/').filter(Boolean);

  if (
    segments.length === 3 &&
    segments[0] === 'blog' &&
    segments[1] === 'page' &&
    segments[2] === '1'
  ) {
    return new URL('/blog', site).toString();
  }

  if (segments[segments.length - 1] === '1') {
    segments.pop();
  }

  const canonicalPath = '/' + segments.join('/');
  return new URL(canonicalPath || '/', site).toString();
}
