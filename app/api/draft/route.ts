import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { DraftGame } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DRAFT_FILE = path.join(DATA_DIR, 'draft.json');

async function readDraft(): Promise<DraftGame> {
  try {
    const data = await fs.readFile(DRAFT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { title: "", desc: "", owner: "" };
  }
}

async function writeDraft(draft: DraftGame): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DRAFT_FILE, JSON.stringify(draft, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const draft = await readDraft();
    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error reading draft:', error);
    return NextResponse.json({ error: 'Failed to read draft' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const draft: DraftGame = await request.json();
    await writeDraft(draft);
    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}
