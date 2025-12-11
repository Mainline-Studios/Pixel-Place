import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { SceneData } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const SCENE_FILE = path.join(DATA_DIR, 'scene.json');

async function readScene(): Promise<SceneData> {
  try {
    const data = await fs.readFile(SCENE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { objects: [] };
  }
}

async function writeScene(scene: SceneData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SCENE_FILE, JSON.stringify(scene, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const scene = await readScene();
    return NextResponse.json(scene);
  } catch (error) {
    console.error('Error reading scene:', error);
    return NextResponse.json({ error: 'Failed to read scene' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const scene: SceneData = await request.json();
    await writeScene(scene);
    return NextResponse.json(scene);
  } catch (error) {
    console.error('Error saving scene:', error);
    return NextResponse.json({ error: 'Failed to save scene' }, { status: 500 });
  }
}
