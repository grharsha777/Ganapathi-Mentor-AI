import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('teams')
      .select(
        `
        *,
        team_members(*)
      `
      )
      .eq('team_members.user_id', user.id)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { name } = body

  if (!name) {
    return NextResponse.json(
      { error: 'Team name is required' },
      { status: 400 }
    )
  }

  try {
    // Create team
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert([{ name, created_by: user.id }])
      .select()

    if (teamError) throw teamError

    const team = teamData[0]

    // Add user as owner
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([
        {
          team_id: team.id,
          user_id: user.id,
          role: 'owner',
        },
      ])

    if (memberError) throw memberError

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    )
  }
}
