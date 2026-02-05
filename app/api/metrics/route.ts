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
      .from('metrics')
      .select('*')
      .eq('team_id', teamId)
      .order('timestamp', { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { team_id, name, value, unit, category } = body

  if (!team_id || !name || value === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabase
      .from('metrics')
      .insert([
        {
          team_id,
          name,
          value: parseFloat(value),
          unit,
          category: category || 'performance',
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error creating metric:', error)
    return NextResponse.json(
      { error: 'Failed to create metric' },
      { status: 500 }
    )
  }
}
