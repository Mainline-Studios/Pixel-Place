'use client';

import { User, Skin, Accessory, TabType } from '@/types';
import { getSkins, getAccessories } from '@/lib/storage';
import Avatar3DViewer from '@/components/Avatar3DViewer';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Wallet, Settings, Sparkles } from 'lucide-react';
import { isBackendConfigured } from '@/lib/backendV1';
interface SidebarProps {
  user: User;
  onNavigate?: (tab: TabType) => void;
}

export default function Sidebar({ user, onNavigate }: SidebarProps) {
  const { t } = useTranslation(['sidebar', 'nav']);
  const [skins, setSkins] = useState<Skin[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);

  const genderLine = useMemo(() => {
    const g = (user.gender || '').toLowerCase();
    if (g === 'boy') return t('sidebar:genderBoy');
    if (g === 'girl') return t('sidebar:genderGirl');
    if (g === 'other') return t('sidebar:genderOther');
    return t('sidebar:genderNA');
  }, [user.gender, t]);

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
    skins[0];
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

  const links: { tab: TabType; label: string; icon: typeof Users }[] = [
    { tab: 'friends', label: t('nav:friends'), icon: Users },
    { tab: 'coins', label: t('nav:coins'), icon: Wallet },
    ...(isBackendConfigured()
      ? ([{ tab: 'premium' as const, label: t('nav:premium'), icon: Sparkles }] as const)
      : []),
    { tab: 'settings', label: t('nav:settings'), icon: Settings },
  ];

  return (
    <aside className="w-full shrink-0 lg:w-[280px] lg:max-w-[280px]">
      <Card className="overflow-hidden border-border/80 bg-card/95 shadow-lg backdrop-blur-sm">
        <ScrollArea className="max-h-[calc(100vh-8rem)]">
          <CardContent className="space-y-4 p-4 pt-6">
            <div className="relative flex min-h-[200px] items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-muted/40 shadow-inner">
              {skinWithAccessories && (
                <Avatar3DViewer
                  skin={skinWithAccessories}
                  width={180}
                  height={180}
                  interactive={true}
                  animation={skinWithAccessories.defaultAnimation || 'idle'}
                  equippedFace={equippedFace || undefined}
                />
              )}
            </div>

            <div className="space-y-1 text-center">
              <p className="truncate text-base font-semibold tracking-tight text-foreground">
                {user.username || ''}
              </p>
              <p className="text-xs text-muted-foreground">{t('sidebar:roleLabel', { role: user.role })}</p>
              <p className="text-xs text-muted-foreground">{genderLine}</p>
            </div>

            <Separator />

            <nav className="flex flex-col gap-1.5" aria-label="Quick navigation">
              {links.map(({ tab, label, icon: Icon }) => (
                <Button
                  key={tab}
                  variant="ghost"
                  className="h-11 w-full justify-start gap-3 rounded-lg px-3 font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => onNavigate?.(tab)}
                  type="button"
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  {label}
                </Button>
              ))}
            </nav>
          </CardContent>
        </ScrollArea>
      </Card>
    </aside>
  );
}
