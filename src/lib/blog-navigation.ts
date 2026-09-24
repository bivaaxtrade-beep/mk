export function navigateToBlog(navigate?: (path: string) => void) {
  if (typeof window === 'undefined') return;
  const { hostname, protocol } = window.location;

  // In sandbox / dev environments keep internal routing so applet preview does not break
  if (
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    hostname.includes('run.app') ||
    hostname.includes('web.app') ||
    hostname.includes('firebaseapp.com') ||
    hostname.includes('aistudio') ||
    hostname.includes('sslip.io')
  ) {
    if (navigate) {
      navigate('/blog');
    } else {
      window.location.href = '/blog';
    }
    return;
  }

  // If already on bloge or blog subdomain
  if (hostname.startsWith('bloge.') || hostname.startsWith('blog.')) {
    if (navigate) {
      navigate('/blog');
    } else {
      window.location.href = '/blog';
    }
    return;
  }

  // On production custom domain (e.g. bivaax.com) redirect directly to bloge.bivaax.com
  const mainDomain = hostname
    .replace(/^www\./, '')
    .replace(/^partner\./, '')
    .replace(/^affiliate\./, '')
    .replace(/^market\./, '')
    .replace(/^news\./, '')
    .replace(/^trade\./, '');

  window.location.href = `${protocol}//bloge.${mainDomain}`;
}
