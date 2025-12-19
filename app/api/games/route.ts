import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { UserMadeGame } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const GAMES_DIR = path.join(DATA_DIR, 'games');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(GAMES_DIR, { recursive: true });
}

// Get all games
export async function GET(request: NextRequest) {
  try {
    await ensureDirectories();
    const files = await fs.readdir(GAMES_DIR);
    const games: UserMadeGame[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(GAMES_DIR, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const game = JSON.parse(content);
          games.push(game);
        } catch (err) {
          console.error(`Error reading game file ${file}:`, err);
        }
      }
    }
    
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error reading games:', error);
    return NextResponse.json({ error: 'Failed to read games' }, { status: 500 });
  }
}

// Save a game
export async function POST(request: NextRequest) {
  try {
    await ensureDirectories();
    const game: UserMadeGame = await request.json();
    
    // Generate filename from game ID or timestamp
    const gameId = game.id || `game-${Date.now()}`;
    const filename = `${gameId}.json`;
    const filePath = path.join(GAMES_DIR, filename);
    
    // Ensure game has required fields
    const gameToSave: UserMadeGame = {
      ...game,
      id: gameId,
      ts: game.ts || Date.now(),
    };
    
    await fs.writeFile(filePath, JSON.stringify(gameToSave, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true, game: gameToSave });
  } catch (error) {
    console.error('Error saving game:', error);
    return NextResponse.json({ error: 'Failed to save game' }, { status: 500 });
  }
}

// Update a game
export async function PUT(request: NextRequest) {
  try {
    await ensureDirectories();
    const game: UserMadeGame = await request.json();
    
    if (!game.id) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    
    const filename = `${game.id}.json`;
    const filePath = path.join(GAMES_DIR, filename);
    
    await fs.writeFile(filePath, JSON.stringify(game, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true, game });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}

// Delete a game
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('id');
    
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    
    const filename = `${gameId}.json`;
    const filePath = path.join(GAMES_DIR, filename);
    
    await fs.unlink(filePath);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
