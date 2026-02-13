/**
 * Performance analytics API - MongoDB or mock data
 * Required env for persistence: MONGODB_URI
 */
import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import Metric from '@/models/Metric';
import { verifyToken } from '@/lib/auth';

const MOCK_SKILL_DATA = [
  { subject: 'React', A: 120, B: 110, fullMark: 150 },
  { subject: 'TypeScript', A: 98, B: 130, fullMark: 150 },
  { subject: 'Node.js', A: 86, B: 130, fullMark: 150 },
  { subject: 'Docker', A: 99, B: 100, fullMark: 150 },
  { subject: 'SQL', A: 85, B: 90, fullMark: 150 },
  { subject: 'System Design', A: 65, B: 85, fullMark: 150 },
];

const MOCK_ROI_DATA = [
  { name: 'Week 1', trainingHours: 10, prReviewTime: 45 },
  { name: 'Week 2', trainingHours: 12, prReviewTime: 38 },
  { name: 'Week 3', trainingHours: 8, prReviewTime: 30 },
  { name: 'Week 4', trainingHours: 15, prReviewTime: 25 },
];

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const conn = await connectSafe();
    let skillData = MOCK_SKILL_DATA;
    let roiData = MOCK_ROI_DATA;
    let useMock = true;

    if (conn) {
      try {
        const metrics = await Metric.find({}).sort({ timestamp: -1 }).limit(50).lean();
        if (metrics.length > 0) {
          const byWeek: Record<string, { trainingHours: number; prReviewTime: number }> = {};
          metrics.forEach((m: any) => {
            const week = m.timestamp ? new Date(m.timestamp).toISOString().slice(0, 10) : 'Week 1';
            if (!byWeek[week]) byWeek[week] = { trainingHours: 0, prReviewTime: 0 };
            if (m.name?.toLowerCase().includes('training')) byWeek[week].trainingHours += m.value || 0;
            else if (m.name?.toLowerCase().includes('review')) byWeek[week].prReviewTime += m.value || 0;
          });
          roiData = Object.entries(byWeek).slice(0, 4).map(([name, v]) => ({ name, ...v }));
          useMock = false;
        }
      } catch (e) {
        console.warn('Metrics fetch failed, using mock:', e);
      }
    }

    return NextResponse.json({
      skillData,
      roiData,
      useMockData: useMock,
    });
  } catch (error: unknown) {
    console.error('Performance fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}
