/** Routes that must show inline sign-in, not the main home login/splash. */
export function isOpenWorldInvitePathname(pathname: string): boolean {
  const p = (pathname || '').replace(/\/$/, '') || '/';
  return p === '/open-world/invite' || p.startsWith('/open-world/invite/');
}

export function isPetHabitatInvitePathname(pathname: string): boolean {
  const p = (pathname || '').replace(/\/$/, '') || '/';
  return p === '/pet-habitat/invite' || p.startsWith('/pet-habitat/invite/');
}

export function isFocusedAuthPathname(pathname: string): boolean {
  const p = (pathname || '').replace(/\/$/, '') || '/';
  return (
    p === '/verify' ||
    p.startsWith('/verify/') ||
    p === '/signoutall' ||
    p.startsWith('/signoutall/') ||
    isOpenWorldInvitePathname(p) ||
    isPetHabitatInvitePathname(p)
  );
}

export function isVerifyPathname(pathname: string): boolean {
  const p = (pathname || '').replace(/\/$/, '') || '/';
  return p === '/verify' || p.startsWith('/verify/');
}

export function isSignOutAllPathname(pathname: string): boolean {
  const p = (pathname || '').replace(/\/$/, '') || '/';
  return p === '/signoutall' || p.startsWith('/signoutall/');
}
