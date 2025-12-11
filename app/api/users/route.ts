import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { User } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, return empty array
    return [];
  }
}

async function writeUsers(users: User[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const users = await readUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error reading users:', error);
    return NextResponse.json({ error: 'Failed to read users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const users = await readUsers();
    const newUser: User = await request.json();
    
    // Check if user already exists - if so, update it
    const existingIndex = users.findIndex(u => u.username.toLowerCase() === newUser.username.toLowerCase());
    if (existingIndex !== -1) {
      users[existingIndex] = newUser;
    } else {
      users.push(newUser);
    }
    
    await writeUsers(users);
    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Failed to create/update user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const users = await readUsers();
    const updatedUser: User = await request.json();
    
    const index = users.findIndex(u => u.username.toLowerCase() === updatedUser.username.toLowerCase());
    if (index === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    users[index] = updatedUser;
    await writeUsers(users);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

