import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Report } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

async function readReports(): Promise<Report[]> {
  try {
    const data = await fs.readFile(REPORTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeReports(reports: Report[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const reports = await readReports();
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error reading reports:', error);
    return NextResponse.json({ error: 'Failed to read reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const reports = await readReports();
    const newReport: Report = await request.json();
    reports.push(newReport);
    await writeReports(reports);
    return NextResponse.json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const reports = await readReports();
    const { id, status, reviewedBy, adminNotes } = await request.json();
    
    const report = reports.find(r => r.id === id);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    
    report.status = status;
    if (reviewedBy) report.reviewedBy = reviewedBy;
    if (adminNotes) report.adminNotes = adminNotes;
    
    await writeReports(reports);
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
