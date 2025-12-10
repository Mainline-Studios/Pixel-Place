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
      <h2 className="section-title">Create Your Game</h2>
      
      <div className="ai-box">
        <div className="ai-label">🎮 How to Build Games</div>
        <div className="ai-output" style={{ lineHeight: '1.8', fontSize: '14px' }}>
          <strong>Step 1: Choose Your Starting Point</strong>
          <br />• Start from scratch in Studio
          <br />• Use a pre-built template from Discover
          <br />• Get AI help with the AI Coder
          <br /><br />
          <strong>Step 2: Build in Studio</strong>
          <br />• Add 3D objects (cubes, spheres, lights)
          <br />• Position and arrange your scene
          <br />• Save your work frequently
          <br /><br />
          <strong>Step 3: Add Details</strong>
          <br />• Give your game a title and description
          <br />• Set up game mechanics (use AI Coder for help)
          <br />• Test your creation
          <br /><br />
          <strong>Step 4: Publish</strong>
          <br />• Save your draft
          <br />• Admins can publish instantly
          <br />• Others can save drafts for review
        </div>
      </div>

      <div className="ai-box">
        <div className="ai-label">Quick Start Guide</div>
        <div className="ai-output" style={{ lineHeight: '1.8', fontSize: '14px' }}>
          <strong>Option A: Use AI Coder</strong>
          <br />1. Go to AI Coder tab
          <br />2. Describe what you want to build
          <br />3. Copy the generated code
          <br />4. Use it in your Studio project
          <br /><br />
          <strong>Option B: Start with Template</strong>
          <br />1. Go to Discover tab
          <br />2. Browse pre-built templates
          <br />3. Click "Use Template"
          <br />4. Customize in Studio
          <br /><br />
          <strong>Option C: Build from Scratch</strong>
          <br />1. Go to Studio tab
          <br />2. Add objects to your scene
          <br />3. Position and customize
          <br />4. Save and publish
        </div>
      </div>

      <div className="ai-box">
        <div className="ai-label">Game Building Tips</div>
        <div className="ai-output" style={{ lineHeight: '1.8', fontSize: '13px' }}>
          • <strong>Start Simple:</strong> Begin with basic shapes and mechanics, then add complexity
          <br />• <strong>Use Lights:</strong> Add lights to make your scene more interesting
          <br />• <strong>Test Often:</strong> Save frequently and test your game as you build
          <br />• <strong>Get Inspiration:</strong> Check out published games and templates
          <br />• <strong>AI Assistance:</strong> Use AI Coder for complex features (donors get unlimited access)
          <br />• <strong>Iterate:</strong> Build, test, improve, repeat!
        </div>
      </div>

      <div className="ai-box">
        <div className="ai-label">Next Steps</div>
        <div className="ai-output">
          Ready to create? Head to <strong>Studio</strong> to start building, or check out <strong>Discover</strong> for templates!
        </div>
      </div>
    </>
  );
}




