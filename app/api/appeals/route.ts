import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { BanAppeal, Ban } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const APPEALS_FILE = path.join(DATA_DIR, 'appeals.json');

async function readAppeals(): Promise<BanAppeal[]> {
  try {
    const data = await fs.readFile(APPEALS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeAppeals(appeals: BanAppeal[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(APPEALS_FILE, JSON.stringify(appeals, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const appeals = await readAppeals();
    return NextResponse.json(appeals);
  } catch (error) {
    console.error('Error reading appeals:', error);
    return NextResponse.json({ error: 'Failed to read appeals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const appeals = await readAppeals();
    const newAppeal: BanAppeal = await request.json();
    appeals.push(newAppeal);
    await writeAppeals(appeals);
    return NextResponse.json(newAppeal);
  } catch (error) {
    console.error('Error creating appeal:', error);
    return NextResponse.json({ error: 'Failed to create appeal' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const appeals = await readAppeals();
    const { id, status, reviewedBy, adminNotes, shouldUnban } = await request.json();
    
    const appeal = appeals.find(a => a.id === id);
    if (!appeal) {
      return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });
    }
    
    appeal.status = status;
    if (reviewedBy) appeal.reviewedBy = reviewedBy;
    if (adminNotes) appeal.adminNotes = adminNotes;
    
    await writeAppeals(appeals);
    
    // If approved and should unban, also unban the user
    if (status === 'approved' && shouldUnban) {
      // Unban the user by deleting the ban
      try {
        const BANS_FILE = path.join(DATA_DIR, 'bans.json');
        
        let bans: Ban[] = [];
        try {
          const data = await fs.readFile(BANS_FILE, 'utf-8');
          bans = JSON.parse(data);
        } catch {}
        
        const filteredBans = bans.filter(b => b.username.toLowerCase() !== appeal.username.toLowerCase());
        await fs.writeFile(BANS_FILE, JSON.stringify(filteredBans, null, 2), 'utf-8');
      } catch (error) {
        console.error('Failed to unban user after appeal approval:', error);
      }
    }
    
    return NextResponse.json(appeal);
  } catch (error) {
    console.error('Error updating appeal:', error);
    return NextResponse.json({ error: 'Failed to update appeal' }, { status: 500 });
  }
}




