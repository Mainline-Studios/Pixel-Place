import { createAppTabPage } from '@/lib/createAppTabPage';

/** Game Studio tab removed — /studio serves Games and Firebase redirects to /games. */
const tab = createAppTabPage('games');
export const metadata = tab.metadata;
export default tab.default;
