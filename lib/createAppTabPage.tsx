import HomeClient from '@/app/HomeClient';
import AppTabSeoBlurb from '@/components/AppTabSeoBlurb';
import { APP_TAB_SEO, buildAppTabMetadata, type AppTabSeoEntry } from '@/lib/appTabSeo';

export function createAppTabPage(tabKey: keyof typeof APP_TAB_SEO) {
  const entry: AppTabSeoEntry = APP_TAB_SEO[tabKey];
  const metadata = buildAppTabMetadata(tabKey);

  function Page() {
    return (
      <>
        <AppTabSeoBlurb entry={entry} />
        <HomeClient />
      </>
    );
  }

  return { metadata, default: Page };
}
