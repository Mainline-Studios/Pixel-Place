import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { PublishedGame } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const PUBLISHED_FILE = path.join(DATA_DIR, 'published.json');

async function readPublished(): Promise<PublishedGame[]> {
  try {
    const data = await fs.readFile(PUBLISHED_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writePublished(games: PublishedGame[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PUBLISHED_FILE, JSON.stringify(games, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const games = await readPublished();
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error reading published games:', error);
    return NextResponse.json({ error: 'Failed to read published games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const games: PublishedGame[] = await request.json();
    await writePublished(games);
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error saving published games:', error);
    return NextResponse.json({ error: 'Failed to save published games' }, { status: 500 });
  }
}
