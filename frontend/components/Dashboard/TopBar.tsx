'use client';

import { TabType, User, Skin, Accessory } from '@/types';
import Image from 'next/image';
import { getSkins, getAccessories } from '@/lib/storage';
import Avatar3DViewer from '@/components/Avatar3DViewer';
import { useUser } from '@/contexts/UserContext';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/lib/formatLocale';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { clearBackendToken } from '@/lib/backendSession';
import { isBackendConfigured } from '@/lib/backendV1';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  ChevronDown,
  Coins,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Settings,
  Sun,
} from 'lucide-react';

interface TopBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  user: User;
}

type TabKeyDef = { key: TabType; nsKey: string; shortcut?: string; adminOnly?: boolean };

const BASE_TAB_KEYS: TabKeyDef[] = [
  { key: 'games', nsKey: 'games', shortcut: 'G' },
  { key: 'studio', nsKey: 'studio', shortcut: 'C' },
  { key: 'avatarShop', nsKey: 'avatarShop', shortcut: 'V' },
  { key: 'coins', nsKey: 'coins', shortcut: 'P' },
  ...(isBackendConfigured()
    ? ([
        { key: 'progression' as const, nsKey: 'progression', shortcut: 'R' },
        { key: 'factions' as const, nsKey: 'factions', shortcut: 'T' },
        { key: 'premium' as const, nsKey: 'premium', shortcut: undefined },
        { key: 'parent' as const, nsKey: 'parent', shortcut: undefined },
      ] as const)
    : []),
  { key: 'friends', nsKey: 'friends', shortcut: 'F' },
  { key: 'settings', nsKey: 'settings', shortcut: 'O' },
];

function tabKeysForUser(user: User): TabKeyDef[] {
  const safe = user.authBackend === 'postgres' && user.backendPayload?.trust?.safeModeEnabled;
  return BASE_TAB_KEYS.filter((t) => !(safe && t.key === 'studio'));
}

export default function TopBar({ currentTab, onTabChange, user }: TopBarProps) {
  const { setUser } = useUser();
  const { t } = useTranslation(['nav', 'topbar', 'common', 'dashboard']);
  const { formatNumber } = useLocaleFormat();
  const { theme, setTheme } = useTheme();
  const [skins, setSkins] = useState<Skin[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [skinsData, accessoriesData] = await Promise.all([getSkins(), getAccessories()]);
      setSkins(Array.isArray(skinsData) ? skinsData : []);
      setAccessories(Array.isArray(accessoriesData) ? accessoriesData : []);
    };
    loadData();
  }, []);

  const equippedSkin =
    skins.find((s) => s.id === user.equippedSkin) ||
    skins.find((s) => s.id === 'starter_classic') ||
    (skins.length > 0 ? skins[0] : null);
  const equippedFace = user.equippedFace
    ? skins.find((s) => s.id === user.equippedFace && s.isFace)
    : null;
  const equippedAccessoriesList = Object.values(user.equippedAccessories || {})
    .map((id) => accessories.find((a) => a.id === id))
    .filter(Boolean) as Accessory[];

  const skinWithAccessories = equippedSkin
    ? {
        ...equippedSkin,
        accessories: [...(equippedSkin.accessories || []), ...equippedAccessoriesList],
      }
    : null;

  const handleLogout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('pixelPlaceLoggedInUser');
        clearBackendToken();
      } catch {
        /* ignore */
      }
    }
  };

  const tabs = tabKeysForUser(user).filter(
    (tab) => !tab.adminOnly || user.role === 'admin' || user.role === 'head_admin'
  );

  const NavLinks = ({ mobile }: { mobile?: boolean }) => (
    <>
      {tabs.map((tab) => {
        const label = t(`nav:${tab.nsKey}`);
        const active = currentTab === tab.key;
        return (
          <Button
            key={tab.key}
            data-tab={tab.key}
            variant={active ? 'secondary' : 'ghost'}
            size={mobile ? 'default' : 'sm'}
            className={cn(
              'shrink-0 rounded-lg font-semibold',
              mobile && 'w-full justify-start',
              active && 'bg-primary/15 text-primary shadow-none ring-1 ring-primary/25'
            )}
            title={tab.shortcut ? t('topbar:shortcutTitle', { label, key: tab.shortcut }) : label}
            onClick={() => {
              onTabChange(tab.key);
              setMobileOpen(false);
            }}
          >
            {label}
            {tab.shortcut && (
              <kbd className="ml-1 hidden rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline">
                {tab.shortcut}
              </kbd>
            )}
          </Button>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-[var(--nav-height)] w-full max-w-[1400px] items-center gap-3 px-4 md:gap-5">
        <div className="brand flex min-w-0 items-center gap-2 md:gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-[min(100vw-2rem,20rem)] flex-col gap-4">
              <SheetHeader>
                <SheetTitle className="text-left">{t('dashboard:brandTitle')}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                <NavLinks mobile />
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt={t('topbar:logoAlt')}
              width={32}
              height={32}
              className="rounded-lg object-contain"
              priority
            />
            <span className="truncate text-base font-bold tracking-tight text-foreground md:text-lg">
              {t('dashboard:brandTitle')}
            </span>
          </div>
        </div>

        <nav className="header-nav hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-1 md:flex lg:gap-2">
          <NavLinks />
        </nav>

        <div className="userbox flex shrink-0 items-center gap-2 md:gap-3">
          <Badge
            variant="secondary"
            className="hidden border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-700 shadow-sm dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300 sm:inline-flex"
          >
            <Coins className="h-3.5 w-3.5" aria-hidden />
            <span className="font-semibold tabular-nums">{formatNumber(user.coins ?? 0)}</span>
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2 rounded-full border-border/80 pl-2 pr-3 shadow-sm"
              >
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted shadow-inner">
                  {skinWithAccessories && (
                    <Avatar3DViewer
                      skin={skinWithAccessories}
                      width={36}
                      height={36}
                      interactive={false}
                      animation={skinWithAccessories.defaultAnimation || 'idle'}
                      equippedFace={equippedFace || undefined}
                    />
                  )}
                </span>
                <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
                  {user.username}
                </span>
                <ChevronDown className="hidden h-4 w-4 opacity-60 sm:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onTabChange('settings')}
                className="cursor-pointer gap-2"
              >
                <Settings className="h-4 w-4" />
                {t('nav:settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer gap-2">
                <Sun className="h-4 w-4" />
                Light
                {theme === 'light' && <span className="ml-auto text-xs">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer gap-2">
                <Moon className="h-4 w-4" />
                Dark
                {theme === 'dark' && <span className="ml-auto text-xs">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer gap-2">
                <Monitor className="h-4 w-4" />
                System
                {theme === 'system' && <span className="ml-auto text-xs">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                {t('common:logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
