import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { getDocuments, setDocument, COLLECTIONS } from '@/lib/firestore';
=======
import { getDb } from '@/lib/db';
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
import { TabContent } from '@/types';

export async function GET() {
  try {
<<<<<<< HEAD
    const tabs = await getDocuments(COLLECTIONS.TAB_CONTENT);
    const content: TabContent = {} as TabContent;
    
    tabs.forEach(tab => {
      (content as any)[tab.tab_name] = tab.content;
=======
    const db = getDb();
    const rows = db.prepare('SELECT * FROM tab_content').all() as any[];
    const content: TabContent = {} as TabContent;
    
    rows.forEach(row => {
      (content as any)[row.tab_name] = row.content;
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    });
    
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error reading tab content:', error);
    return NextResponse.json({ error: 'Failed to read tab content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const content: TabContent = await request.json();
    
<<<<<<< HEAD
    for (const [tabName, tabContent] of Object.entries(content)) {
      await setDocument(COLLECTIONS.TAB_CONTENT, tabName, {
        tab_name: tabName,
        content: tabContent,
        updated_at: Date.now()
      });
    }
=======
    const insert = db.prepare(`
      INSERT INTO tab_content (tab_name, content, updated_at)
      VALUES (?, ?, strftime('%s', 'now'))
      ON CONFLICT(tab_name) DO UPDATE SET
        content = excluded.content,
        updated_at = strftime('%s', 'now')
    `);
    
    const insertMany = db.transaction((content: TabContent) => {
      for (const [tabName, tabContent] of Object.entries(content)) {
        insert.run(tabName, tabContent);
      }
    });
    
    insertMany(content);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error saving tab content:', error);
    return NextResponse.json({ error: 'Failed to save tab content' }, { status: 500 });
  }
}
