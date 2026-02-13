import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Team, TeamMember } from '@/models/Team';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await connectToDatabase();

    // Find all team memberships for this user
    const memberships = await TeamMember.find({ user_id: decoded.userId }).populate('team_id');

    // Extract teams from memberships
    const teams = memberships.map(m => m.team_id);

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token) as any;
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await connectToDatabase();
    const { name } = await req.json();

    if (!name) return NextResponse.json({ error: 'Team name is required' }, { status: 400 });

    // Create Team
    const newTeam = await Team.create({
      name,
      created_by: decoded.userId
    });

    // Add user as owner
    await TeamMember.create({
      team_id: newTeam._id,
      user_id: decoded.userId,
      role: 'owner'
    });

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
