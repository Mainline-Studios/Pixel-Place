'use client';

import { useMemo } from 'react';
import { User } from '@/types';
import { getSkins } from '@/lib/storage';
import Avatar3D from '../Avatar3D';

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const skin = useMemo(() => {
    const skins = getSkins();
    return skins.find(s => s.id === user.equippedSkin) || skins[0];
  }, [user.equippedSkin]);

  return (
    <aside className="sidebar-card">
      <div className="avatar-showcase">
        <div style={{ width: '100%', height: '210px', position: 'relative' }}>
          {skin && <Avatar3D skin={skin} size={1} autoRotate={true} />}
        </div>
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




