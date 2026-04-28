import { NextRequest, NextResponse } from 'next/server';
import { addDocument, updateDocument, COLLECTIONS, getDocuments } from '@/lib/firestore';
import type { Report, ReportType } from '@/types';
import { getAuthenticatedUser } from '@/lib/server/apiAuth';
import { isModerator } from '@/lib/moderation/roles';
import { allowReport } from '@/lib/moderation/rateLimit';
import { getClientIp, hashIp } from '@/lib/moderation/ip';
import { writeAuditLog } from '@/lib/moderation/audit';

function reportFromDoc(doc: any): Report {
  const target =
    doc.target_username ||
    doc.reported_username ||
    '';
  return {
    id: doc.id,
    reportedUsername: target,
    reporterUsername: doc.reporter_username || doc.reported_by || '',
    reportType: doc.report_type as ReportType | undefined,
    targetUsername: doc.target_username || doc.reported_username || '',
    canvasId: doc.canvas_id,
    pixelX: typeof doc.pixel_x === 'number' ? doc.pixel_x : undefined,
    pixelY: typeof doc.pixel_y === 'number' ? doc.pixel_y : undefined,
    chatRoomId: doc.chat_room_id,
    messageId: doc.message_id,
    reason: doc.reason || '',
    description: doc.description || '',
    timestamp: doc.created_at || doc.timestamp || Date.now(),
    status: doc.status || 'pending',
    reviewedBy: doc.reviewed_by,
    adminNotes: doc.admin_notes,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || !isModerator(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const reports = await getDocuments(COLLECTIONS.REPORTS, (ref: any) =>
        ref.orderBy('created_at', 'desc').limit(200)
      );
      return NextResponse.json(reports.map(reportFromDoc));
    } catch {
      const reports = await getDocuments(COLLECTIONS.REPORTS);
      return NextResponse.json(
        reports
          .sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0))
          .map(reportFromDoc)
      );
    }
  } catch (error) {
    console.error('Error reading reports:', error);
    return NextResponse.json({ error: 'Failed to read reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = hashIp(getClientIp(request));
    if (!allowReport(ip)) {
      return NextResponse.json({ error: 'Too many reports. Try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const authUser = await getAuthenticatedUser(request);

    const reporter =
      String(body.reporterUsername || body.reportedBy || '').trim() ||
      (authUser ? authUser.username : '');
    if (!reporter) {
      return NextResponse.json({ error: 'Reporter identity required' }, { status: 400 });
    }

    if (authUser && authUser.username.toLowerCase() !== reporter.toLowerCase()) {
      return NextResponse.json({ error: 'Reporter mismatch' }, { status: 403 });
    }

    const reportType = (body.reportType || 'user') as ReportType;
    const targetUsername = String(
      body.targetUsername || body.reportedUsername || ''
    ).trim();

    if (!targetUsername && reportType === 'user') {
      return NextResponse.json({ error: 'targetUsername required' }, { status: 400 });
    }

    const reportId = await addDocument(COLLECTIONS.REPORTS, {
      report_type: reportType,
      target_username: targetUsername,
      reported_username: targetUsername,
      reporter_username: reporter,
      reported_by: reporter,
      reason: String(body.reason || 'report'),
      description: String(body.description || ''),
      canvas_id: body.canvasId || '',
      pixel_x: typeof body.pixelX === 'number' ? body.pixelX : undefined,
      pixel_y: typeof body.pixelY === 'number' ? body.pixelY : undefined,
      chat_room_id: body.chatRoomId || '',
      message_id: body.messageId || '',
      status: 'pending',
      created_at: Date.now(),
      reporter_ip_hash: ip,
    });

    const createdReport: Report = {
      id: reportId,
      reportedUsername: targetUsername,
      reporterUsername: reporter,
      reportType,
      targetUsername,
      canvasId: body.canvasId,
      pixelX: body.pixelX,
      pixelY: body.pixelY,
      chatRoomId: body.chatRoomId,
      messageId: body.messageId,
      reason: String(body.reason || ''),
      description: String(body.description || ''),
      timestamp: Date.now(),
      status: 'pending',
    };

    return NextResponse.json(createdReport);
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const moderator = await getAuthenticatedUser(request);
    if (!moderator || !isModerator(moderator.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, status, reviewedBy, adminNotes } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Report id required' }, { status: 400 });
    }

    const reports = await getDocuments(COLLECTIONS.REPORTS);
    const report = reports.find((r: any) => r.id === id);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    await updateDocument(COLLECTIONS.REPORTS, id, {
      status: status || 'reviewed',
      reviewed_by: reviewedBy || moderator.username,
      reviewed_at: Date.now(),
      admin_notes: adminNotes || '',
    });

    await writeAuditLog({
      actorUsername: moderator.username,
      action: 'report_resolve',
      targetType: 'report',
      targetId: id,
      metadata: { status, notes: adminNotes },
      ipHash: hashIp(getClientIp(request)),
    });

    const updated = await getDocuments(COLLECTIONS.REPORTS);
    const updatedReport = updated.find((r: any) => r.id === id);
    return NextResponse.json(reportFromDoc(updatedReport || report));
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
