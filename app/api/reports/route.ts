import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Report } from '@/types';

function reportFromRow(row: any): Report {
  return {
    id: row.id.toString(),
    reportedUsername: row.reported_username,
    reportedBy: row.reported_by,
    reason: row.reason,
    description: row.description || '',
    status: row.status || 'pending',
    reviewedBy: row.reviewed_by,
    adminNotes: row.admin_notes || undefined,
    reviewedAt: row.reviewed_at ? row.reviewed_at * 1000 : undefined
  };
}

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM reports ORDER BY created_at DESC').all();
    const reports = rows.map(reportFromRow);
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error reading reports:', error);
    return NextResponse.json({ error: 'Failed to read reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const newReport: Report = await request.json();
    
    const result = db.prepare(`
      INSERT INTO reports (reported_username, reported_by, reason, description, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).run(
      newReport.reportedUsername,
      newReport.reportedBy,
      newReport.reason,
      newReport.description || ''
    );
    
    const createdReport: Report = {
      ...newReport,
      id: result.lastInsertRowid.toString(),
      status: 'pending'
    };
    
    return NextResponse.json(createdReport);
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getDb();
    const { id, status, reviewedBy, adminNotes } = await request.json();
    
    const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(parseInt(id));
    if (!row) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    
    db.prepare(`
      UPDATE reports SET
        status = ?,
        reviewed_by = ?,
        reviewed_at = strftime('%s', 'now')
      WHERE id = ?
    `).run(status, reviewedBy, parseInt(id));
    
    const updated = db.prepare('SELECT * FROM reports WHERE id = ?').get(parseInt(id));
    return NextResponse.json(reportFromRow(updated));
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}




