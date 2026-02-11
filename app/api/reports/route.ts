import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { getDocuments, addDocument, updateDocument, COLLECTIONS } from '@/lib/firestore';
import { Report } from '@/types';

function reportFromDoc(doc: any): Report {
  return {
    id: doc.id,
    reportedUsername: doc.reported_username,
    reportedBy: doc.reported_by,
    reason: doc.reason,
    description: doc.description || '',
    status: doc.status || 'pending',
    reviewedBy: doc.reviewed_by,
    adminNotes: doc.admin_notes || undefined,
    reviewedAt: doc.reviewed_at
=======
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
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  };
}

export async function GET() {
  try {
<<<<<<< HEAD
    const reports = await getDocuments(COLLECTIONS.REPORTS, (ref) => ref.orderBy('created_at', 'desc'));
    return NextResponse.json(reports.map(reportFromDoc));
=======
    const db = getDb();
    const rows = db.prepare('SELECT * FROM reports ORDER BY created_at DESC').all();
    const reports = rows.map(reportFromRow);
    return NextResponse.json(reports);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  } catch (error) {
    console.error('Error reading reports:', error);
    return NextResponse.json({ error: 'Failed to read reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
<<<<<<< HEAD
    const newReport: Report = await request.json();
    
    const reportId = await addDocument(COLLECTIONS.REPORTS, {
      reported_username: newReport.reportedUsername,
      reported_by: newReport.reportedBy,
      reason: newReport.reason,
      description: newReport.description || '',
      status: 'pending',
      created_at: Date.now()
    });
    
    const createdReport: Report = {
      ...newReport,
      id: reportId,
=======
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
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
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
<<<<<<< HEAD
    const { id, status, reviewedBy, adminNotes } = await request.json();
    
    const reports = await getDocuments(COLLECTIONS.REPORTS);
    const report = reports.find(r => r.id === id);
    
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    
    await updateDocument(COLLECTIONS.REPORTS, id, {
      status: status,
      reviewed_by: reviewedBy,
      reviewed_at: Date.now()
    });
    
    const updated = await getDocuments(COLLECTIONS.REPORTS);
    const updatedReport = updated.find(r => r.id === id);
    return NextResponse.json(reportFromDoc(updatedReport || report));
=======
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
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
<<<<<<< HEAD
=======




>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
