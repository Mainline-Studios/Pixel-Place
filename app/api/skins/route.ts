import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Skin } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const SKINS_FILE = path.join(DATA_DIR, 'skins.json');

async function readSkins(): Promise<Skin[]> {
  try {
    const data = await fs.readFile(SKINS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeSkins(skins: Skin[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SKINS_FILE, JSON.stringify(skins, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const skins = await readSkins();
    return NextResponse.json(skins);
  } catch (error) {
    console.error('Error reading skins:', error);
    return NextResponse.json({ error: 'Failed to read skins' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const skins: Skin[] = await request.json();
    await writeSkins(skins);
    return NextResponse.json(skins);
  } catch (error) {
    console.error('Error saving skins:', error);
    return NextResponse.json({ error: 'Failed to save skins' }, { status: 500 });
  }
}
