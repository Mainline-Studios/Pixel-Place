import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Accessory } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const ACCESSORIES_FILE = path.join(DATA_DIR, 'accessories.json');

async function readAccessories(): Promise<Accessory[]> {
  try {
    const data = await fs.readFile(ACCESSORIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeAccessories(accessories: Accessory[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ACCESSORIES_FILE, JSON.stringify(accessories, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const accessories = await readAccessories();
    return NextResponse.json(accessories);
  } catch (error) {
    console.error('Error reading accessories:', error);
    return NextResponse.json({ error: 'Failed to read accessories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessories: Accessory[] = await request.json();
    await writeAccessories(accessories);
    return NextResponse.json(accessories);
  } catch (error) {
    console.error('Error saving accessories:', error);
    return NextResponse.json({ error: 'Failed to save accessories' }, { status: 500 });
  }
}
