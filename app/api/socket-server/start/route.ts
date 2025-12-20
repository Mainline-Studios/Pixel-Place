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

    // Start the server - use detached mode so it runs independently
    const nodePath = process.execPath;
    serverProcess = spawn(nodePath, [serverPath], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.cwd(),
      env: { 
        ...process.env,
        SOCKET_PORT: process.env.SOCKET_PORT || '3001',
        PORT: process.env.SOCKET_PORT || '3001',
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
      }
    });

    // Unref the process so it doesn't keep the parent alive
    serverProcess.unref();

    // Handle process events
    let errorOutput = '';
    let successOutput = '';

    serverProcess.stdout.on('data', (data: Buffer) => {
      const output = data.toString();
      console.log(`[Socket Server] ${output}`);
      successOutput += output;
    });

    serverProcess.stderr.on('data', (data: Buffer) => {
      const output = data.toString();
      console.error(`[Socket Server Error] ${output}`);
      errorOutput += output;
    });

    serverProcess.on('exit', (code: number) => {
      console.log(`[Socket Server] Process exited with code ${code}`);
      if (code !== 0 && code !== null) {
        console.error(`[Socket Server] Error output: ${errorOutput}`);
      }
      serverProcess = null;
    });

    serverProcess.on('error', (error: Error) => {
      console.error(`[Socket Server] Failed to start:`, error);
      serverProcess = null;
    });

    // Wait a moment to see if server starts successfully
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if process is still running by checking exit code
    // Note: With detached process, killed might not work as expected
    if (serverProcess && serverProcess.exitCode === null) {
      // Process is still running
      return NextResponse.json({
        success: true,
        message: 'Socket server started successfully',
        pid: serverProcess.pid
      });
    } else if (errorOutput) {
      // Process exited with error
      return NextResponse.json(
        { success: false, error: `Server failed to start: ${errorOutput.substring(0, 200)}` },
        { status: 500 }
      );
    } else {
      // Check if server is actually running by trying to connect
      try {
        const checkResponse = await fetch(`${socketUrl}/socket.io/`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000)
        });
        if (checkResponse.status === 400 || checkResponse.ok) {
          return NextResponse.json({
            success: true,
            message: 'Socket server is running',
            pid: serverProcess?.pid
          });
        }
      } catch (e) {
        // Server not responding yet, but process might still be starting
        return NextResponse.json({
          success: true,
          message: 'Socket server process started (checking connection...)',
          pid: serverProcess?.pid,
          warning: 'Server may still be initializing'
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Server process exited immediately. Check server logs for details.' },
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
