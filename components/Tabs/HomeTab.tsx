'use client';

import { useState, useEffect } from 'react';
import { User, Skin, TabContent } from '@/types';
import { getSkins, getTabContent } from '@/lib/storage';
import { escapeHTML } from '@/lib/utils';

interface HomeTabProps {
  user: User;
  editMode: boolean;
}

export default function HomeTab({ user, editMode }: HomeTabProps) {
  const coinsDisplay = typeof user.coins === 'number' ? user.coins : 0;
  const [skins, setSkins] = useState<Skin[]>([]);
  const [tabContent, setTabContent] = useState<TabContent>({} as TabContent);

  useEffect(() => {
    const loadData = async () => {
      const [skinsData, tabData] = await Promise.all([getSkins(), getTabContent()]);
      setSkins(skinsData);
      setTabContent(tabData);
    };
    loadData();
  }, []);

  const equippedSkin = skins.find(s => s.id === user.equippedSkin);
  const equippedSkinName = equippedSkin ? equippedSkin.name : 'None';

  return (
    <>
      <h2 className="section-title">Home</h2>
      <div className="ai-box">
        <div className="ai-label">Account Snapshot</div>
        <div className="ai-output">
          Username: {escapeHTML(user.username)}
          Role: {escapeHTML(user.role)}
          Coins: {coinsDisplay}
          Gender: {escapeHTML(user.gender || 'N/A')}
          Equipped Skin: {escapeHTML(equippedSkinName)}
        </div>
      </div>
      <div className="ai-box">
        <div className="ai-label">Home Info</div>
        <div className="ai-output">{tabContent.home || ''}</div>
      </div>
    </>
  );
}




