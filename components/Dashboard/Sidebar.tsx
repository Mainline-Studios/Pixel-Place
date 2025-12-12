'use client';

import { User } from '@/types';
import { getSkins, getAccessories, findSkin } from '@/lib/storage';
import Avatar3DViewer from '@/components/Avatar3DViewer';

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const skins = getSkins();
  const accessories = getAccessories();
  const equippedSkin = findSkin(skins, user.equippedSkin);
  const equippedAccessoriesList = (user.equippedAccessories || []).map(id => accessories.find(a => a.id === id)).filter(Boolean) as any[];

  // Merge equipped accessories into skin for display
  const skinWithAccessories = equippedSkin ? {
    ...equippedSkin,
    accessories: [
      ...(equippedSkin.accessories || []),
      ...equippedAccessoriesList
    ]
  } : null;

  return (
    <aside className="sidebar-card">
      <div className="avatar-showcase" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        background: 'transparent'
      }}>
        {skinWithAccessories && (
          <Avatar3DViewer
            skin={skinWithAccessories}
            width={180}
            height={180}
            interactive={true}
            animation={skinWithAccessories.defaultAnimation || 'idle'}
          />
        )}
      </div>
      <div className="info-name">{user.username}</div>
      <div className="info-role">Role: {user.role}</div>
      <div className="info-gender">Gender: {user.gender || 'N/A'}</div>
      <div className="sidebar-sep"></div>
      <div className="sidebar-link">Profile</div>
      <div className="sidebar-link">Inventory</div>
      <div className="sidebar-link">Badges</div>
      <div className="sidebar-link">Messages</div>
    </aside>
  );
}




