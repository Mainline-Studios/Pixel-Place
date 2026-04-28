import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, setDocument, COLLECTIONS } from '@/lib/firestore';import { TabContent } from '@/types';

export async function GET() {
  try {
    const tabs = await getDocuments(COLLECTIONS.TAB_CONTENT);
    const content: TabContent = {} as TabContent;
    
    tabs.forEach(tab => {
      (content as any)[tab.tab_name] = tab.content;    });
    
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
    
    for (const [tabName, tabContent] of Object.entries(content)) {
      await setDocument(COLLECTIONS.TAB_CONTENT, tabName, {
        tab_name: tabName,
        content: tabContent,
        updated_at: Date.now()
      });
    }    
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error saving tab content:', error);
    return NextResponse.json({ error: 'Failed to save tab content' }, { status: 500 });
  }
}
