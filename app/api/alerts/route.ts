import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const teamId = searchParams.get('teamId')

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { team_id, title, description, severity, metric_id } = body

  if (!team_id || !title) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabase
      .from('alerts')
      .insert([
        {
          team_id,
          title,
          description,
          severity: severity || 'info',
          metric_id,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { id, is_read } = body

  if (!id || is_read === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabase
      .from('alerts')
      .update({ is_read })
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}
