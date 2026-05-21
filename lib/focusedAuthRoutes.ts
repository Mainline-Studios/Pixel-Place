/** Routes that must show inline sign-in, not the main home login/splash. */
export function isFocusedAuthPathname(pathname: string): boolean {
  const p = (pathname || '').replace(/\/$/, '') || '/';
  return p === '/verify' || p.startsWith('/verify/') || p === '/signoutall' || p.startsWith('/signoutall/');
}

export function isVerifyPathname(pathname: string): boolean {
  const p = (pathname || '').replace(/\/$/, '') || '/';
  return p === '/verify' || p.startsWith('/verify/');
}

export function isSignOutAllPathname(pathname: string): boolean {
  const p = (pathname || '').replace(/\/$/, '') || '/';
  return p === '/signoutall' || p.startsWith('/signoutall/');
}
