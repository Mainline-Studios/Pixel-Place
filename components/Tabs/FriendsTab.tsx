'use client';

import { User } from '@/types';
import { getTabContent } from '@/lib/storage';

interface FriendsTabProps {
  user: User;
  editMode: boolean;
}

export default function FriendsTab({ user, editMode }: FriendsTabProps) {
  const tabContent = getTabContent();

  return (
    <>
      <h2 className="section-title">Friends</h2>
      <div className="ai-box">
        <div className="ai-label">Friend System</div>
        <div className="ai-output">
          • Add friends (coming soon)
          <br />
          • Party up (coming soon)
          <br />
          • Direct message (coming soon)
        </div>
      </div>
      <div className="ai-box">
        <div className="ai-label">Friends Info</div>
        <div className="ai-output">{tabContent.friends || ''}</div>
      </div>
    </>
  );
}




