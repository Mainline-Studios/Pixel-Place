import { NextRequest, NextResponse } from 'next/server';
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
    reviewedAt: doc.reviewed_at  };
}

export async function GET() {
  try {
    const reports = await getDocuments(COLLECTIONS.REPORTS, (ref) => ref.orderBy('created_at', 'desc'));
    return NextResponse.json(reports.map(reportFromDoc));  } catch (error) {
    console.error('Error reading reports:', error);
    return NextResponse.json({ error: 'Failed to read reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
      id: reportId,      status: 'pending'
    };
    
    return NextResponse.json(createdReport);
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
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
    return NextResponse.json(reportFromDoc(updatedReport || report));  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
