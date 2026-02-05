'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface Team {
  id: string
  name: string
}

export function TeamSelector({
  selectedTeam,
  onTeamSelect,
}: {
  selectedTeam: string | null
  onTeamSelect: (teamId: string) => void
}) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [newTeamName, setNewTeamName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch('/api/teams')
        if (res.ok) {
          const data = await res.json()
          setTeams(data)
          if (data.length > 0 && !selectedTeam) {
            onTeamSelect(data[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching teams:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [selectedTeam, onTeamSelect])

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return

    setCreating(true)
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName }),
      })

      if (res.ok) {
        const newTeam = await res.json()
        setTeams([...teams, newTeam])
        onTeamSelect(newTeam.id)
        setNewTeamName('')
      }
    } catch (error) {
      console.error('Error creating team:', error)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading teams...</div>
  }

  return (
    <div className="flex gap-2">
      <Select value={selectedTeam || ''} onValueChange={onTeamSelect}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a team" />
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Add a new team to organize your metrics and analytics
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateTeam()
                }
              }}
            />
            <Button
              onClick={handleCreateTeam}
              disabled={!newTeamName.trim() || creating}
              className="w-full"
            >
              {creating ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
