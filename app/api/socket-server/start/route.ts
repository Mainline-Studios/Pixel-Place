import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Store server process reference (in production, use a proper process manager)
let serverProcess: any = null;

export async function POST(request: NextRequest) {
  try {
    // Check if server.js exists
    const serverPath = path.join(process.cwd(), 'server.js');
    if (!fs.existsSync(serverPath)) {
      return NextResponse.json(
        { success: false, error: 'server.js not found' },
        { status: 404 }
      );
    }

    // Check if server is already running by trying to connect
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    try {
      const checkResponse = await fetch(`${socketUrl}/socket.io/`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      if (checkResponse.ok || checkResponse.status === 400) {
        // Socket.io returns 400 for GET requests, which means server is running
        return NextResponse.json({
          success: true,
          message: 'Socket server is already running',
          alreadyRunning: true
        });
      }
    } catch (e) {
      // Server is not running, proceed to start it
    }

    // If we already have a process, don't start another
    if (serverProcess && !serverProcess.killed) {
      return NextResponse.json({
        success: true,
        message: 'Socket server process already started',
        alreadyRunning: true
      });
    }

    // Start the server
    const nodePath = process.execPath;
    serverProcess = spawn(nodePath, [serverPath], {
      detached: false,
      stdio: 'pipe',
      cwd: process.cwd(),
      env: { ...process.env }
    });

    // Handle process events
    serverProcess.stdout.on('data', (data: Buffer) => {
      console.log(`[Socket Server] ${data.toString()}`);
    });

    serverProcess.stderr.on('data', (data: Buffer) => {
      console.error(`[Socket Server Error] ${data.toString()}`);
    });

    serverProcess.on('exit', (code: number) => {
      console.log(`[Socket Server] Process exited with code ${code}`);
      serverProcess = null;
    });

    serverProcess.on('error', (error: Error) => {
      console.error(`[Socket Server] Failed to start:`, error);
      serverProcess = null;
    });

    // Wait a moment to see if server starts successfully
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if process is still running
    if (serverProcess && !serverProcess.killed) {
      return NextResponse.json({
        success: true,
        message: 'Socket server started successfully',
        pid: serverProcess.pid
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Server process exited immediately' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error starting socket server:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to start socket server' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    // Try to check if server is running
    try {
      const checkResponse = await fetch(`${socketUrl}/socket.io/`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      // Socket.io returns 400 for GET requests, which means server is running
      if (checkResponse.status === 400 || checkResponse.ok) {
        return NextResponse.json({
          success: true,
          running: true,
          message: 'Socket server is running'
        });
      }
    } catch (e) {
      return NextResponse.json({
        success: false,
        running: false,
        message: 'Socket server is not running'
      });
    }
    
    return NextResponse.json({
      success: false,
      running: false,
      message: 'Socket server is not running'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      running: false,
      message: error.message || 'Unable to check server status'
    });
  }
}
