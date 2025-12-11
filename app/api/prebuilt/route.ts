import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { PrebuiltGame } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const PREBUILT_FILE = path.join(DATA_DIR, 'prebuilt.json');

async function readPrebuilt(): Promise<PrebuiltGame[]> {
  try {
    const data = await fs.readFile(PREBUILT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writePrebuilt(games: PrebuiltGame[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PREBUILT_FILE, JSON.stringify(games, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const games = await readPrebuilt();
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error reading prebuilt games:', error);
    return NextResponse.json({ error: 'Failed to read prebuilt games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const games: PrebuiltGame[] = await request.json();
    await writePrebuilt(games);
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error saving prebuilt games:', error);
    return NextResponse.json({ error: 'Failed to save prebuilt games' }, { status: 500 });
  }
}
