export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, addDocument, updateDocument, getDocument, setDocument, COLLECTIONS } from '@/lib/firestore';
import { Report } from '@/types';
import { clampUserBoardScore, USERBOARD_REPORT_BUMP } from '@/lib/userBoard';
import { requireAuth, requireAdmin } from '@/lib/middleware';

async function bumpUserBoardScoreOnReport(reportedUsername: string) {
  const id = reportedUsername.trim().toLowerCase();
  if (!id) return 0;
  const existing = await getDocument(COLLECTIONS.USER_SAFETY, id);
  const current =
    typeof (existing as { safety_score?: number } | null)?.safety_score === 'number'
      ? clampUserBoardScore((existing as { safety_score: number }).safety_score)
      : 0;
  const reportCount =
    typeof (existing as { report_count?: number } | null)?.report_count === 'number'
      ? Math.max(0, Math.floor((existing as { report_count: number }).report_count))
      : 0;
  const next = clampUserBoardScore(current + USERBOARD_REPORT_BUMP);
  await setDocument(COLLECTIONS.USER_SAFETY, id, {
    username: reportedUsername.trim(),
    safety_score: next,
    report_count: reportCount + 1,
    last_report_at: Date.now(),
    updated_at: Date.now(),
  });
  return next;
}

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

export async function GET(request: NextRequest) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) return auth.error;

    const reports = await getDocuments(COLLECTIONS.REPORTS, (ref) => ref.orderBy('created_at', 'desc'));
    return NextResponse.json(reports.map(reportFromDoc));  } catch (error) {
    console.error('Error reading reports:', error);
    return NextResponse.json({ error: 'Failed to read reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    const newReport: Report = await request.json();
    const reportedUsername = String(newReport.reportedUsername ?? '').trim();
    const reason = String(newReport.reason ?? '').trim();
    const description = String(newReport.description ?? '').trim();
    if (!reportedUsername) {
      return NextResponse.json({ error: 'reportedUsername required' }, { status: 400 });
    }
    if (reportedUsername.toLowerCase() === auth.user!.username.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot report yourself' }, { status: 400 });
    }

    const reportId = await addDocument(COLLECTIONS.REPORTS, {
      reported_username: reportedUsername,
      reported_by: auth.user!.username,
      reason,
      description,
      status: 'pending',
      created_at: Date.now(),
    });

    const userBoardScoreAfter = await bumpUserBoardScoreOnReport(reportedUsername);

    const createdReport: Report = {
      ...newReport,
      reportedUsername,
      reporterUsername: auth.user!.username,
      id: reportId,
      status: 'pending',
    };

    return NextResponse.json({ ...createdReport, userBoardScoreAfter });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) return auth.error;

    const { id, status, adminNotes } = await request.json();

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const VALID_STATUSES = ['pending', 'resolved', 'dismissed'];
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
    }
    
    const reports = await getDocuments(COLLECTIONS.REPORTS);
    const report = reports.find(r => r.id === id);
    
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const updateData: Record<string, any> = {
      status: status,
      reviewed_by: auth.user!.username,
      reviewed_at: Date.now(),
    };
    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }
    
    await updateDocument(COLLECTIONS.REPORTS, id, updateData);
    
    const updated = await getDocuments(COLLECTIONS.REPORTS);
    const updatedReport = updated.find(r => r.id === id);
    return NextResponse.json(reportFromDoc(updatedReport || report));  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
