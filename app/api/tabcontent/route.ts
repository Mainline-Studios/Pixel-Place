import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { TabContent } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TAB_CONTENT_FILE = path.join(DATA_DIR, 'tabcontent.json');

async function readTabContent(): Promise<TabContent> {
  try {
    const data = await fs.readFile(TAB_CONTENT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {} as TabContent;
  }
}

async function writeTabContent(content: TabContent): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(TAB_CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const content = await readTabContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error reading tab content:', error);
    return NextResponse.json({ error: 'Failed to read tab content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const content: TabContent = await request.json();
    await writeTabContent(content);
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error saving tab content:', error);
    return NextResponse.json({ error: 'Failed to save tab content' }, { status: 500 });
  }
}
