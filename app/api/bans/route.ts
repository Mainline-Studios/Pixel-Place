import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Ban } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const BANS_FILE = path.join(DATA_DIR, 'bans.json');

async function readBans(): Promise<Ban[]> {
  try {
    const data = await fs.readFile(BANS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeBans(bans: Ban[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(BANS_FILE, JSON.stringify(bans, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const bans = await readBans();
    return NextResponse.json(bans);
  } catch (error) {
    console.error('Error reading bans:', error);
    return NextResponse.json({ error: 'Failed to read bans' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const bans = await readBans();
    const newBan: Ban = await request.json();
    
    // Remove existing ban for this user
    const filteredBans = bans.filter(b => b.username.toLowerCase() !== newBan.username.toLowerCase());
    filteredBans.push(newBan);
    
    await writeBans(filteredBans);
    return NextResponse.json(newBan);
  } catch (error) {
    console.error('Error creating ban:', error);
    return NextResponse.json({ error: 'Failed to create ban' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }
    
    const bans = await readBans();
    const filteredBans = bans.filter(b => b.username.toLowerCase() !== username.toLowerCase());
    await writeBans(filteredBans);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ban:', error);
    return NextResponse.json({ error: 'Failed to delete ban' }, { status: 500 });
  }
}

