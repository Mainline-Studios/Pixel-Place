'use client';

import { User } from '@/types';
import { getTabContent } from '@/lib/storage';

interface CreateTabProps {
  user: User;
  editMode: boolean;
}

export default function CreateTab({ user, editMode }: CreateTabProps) {
  const tabContent = getTabContent();

  return (
    <>
      <h2 className="section-title">Create</h2>
      <div className="ai-box">
        <div className="ai-label">Project Starter</div>
        <div className="ai-output">
          Create a new experience and refine it in Studio. Admins can publish it live instantly, no approval.
        </div>
      </div>
      <div className="ai-box">
        <div className="ai-label">Create Info</div>
        <div className="ai-output">{tabContent.createGame || ''}</div>
      </div>
    </>
  );
}




