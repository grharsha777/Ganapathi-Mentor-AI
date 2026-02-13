/**
 * Anomaly detection API - MongoDB or mock data
 * Required env for persistence: MONGODB_URI
 */
import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import Anomaly from '@/models/Anomaly';
import { verifyToken } from '@/lib/auth';

const MOCK_ANOMALIES = [
  { severity: 'high', message: 'Learning velocity dropped 35% vs last week', recommendation: 'Schedule 1:1s with at-risk learners' },
  { severity: 'medium', message: 'Low engagement on React module', recommendation: 'Add hands-on exercises or pair programming' },
  { severity: 'low', message: 'Unusual spike in Docker-related questions', recommendation: 'Consider a Docker deep-dive session' },
];

const MOCK_PREDICTIONS = [
  { prediction: 'TypeScript proficiency will improve 15% in 2 weeks', topic: 'TypeScript', reason: 'Current completion rate and engagement' },
  { prediction: 'System design module may need reinforcement', topic: 'System Design', reason: 'Below-average quiz scores' },
];

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const conn = await connectSafe();
    let anomalies = MOCK_ANOMALIES;
    let useMock = true;

    if (conn) {
      try {
        const dbAnomalies = await Anomaly.find({}).sort({ detected_at: -1 }).limit(20).lean();
        if (dbAnomalies.length > 0) {
          anomalies = dbAnomalies.map((a: any) => ({
            severity: a.severity || 'medium',
            message: a.description || a.metric_name || 'Anomaly detected',
            recommendation: 'Review and investigate',
          }));
          useMock = false;
        }
      } catch (e) {
        console.warn('Anomaly fetch failed, using mock:', e);
      }
    }

    const teamVelocity = { current: 42, previous: 65 };
    const predictions = MOCK_PREDICTIONS;

    return NextResponse.json({
      teamVelocity,
      anomalies,
      predictions,
      useMockData: useMock,
    });
  } catch (error: unknown) {
    console.error('Anomalies fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const conn = await connectSafe();
    if (!conn) {
      return NextResponse.json(
        { error: 'Database not configured. Add MONGODB_URI to persist anomalies.' },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const newAnomaly = await Anomaly.create({
      team_id: body.team_id || body.teamId || '000000000000000000000001',
      metric_name: body.metric_name || body.metricName || 'custom',
      value: body.value ?? 0,
      threshold: body.threshold ?? 0,
      severity: body.severity || 'medium',
      description: body.description || body.message,
    });

    return NextResponse.json({ success: true, anomaly: newAnomaly });
  } catch (error: unknown) {
    console.error('Anomaly create error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}
