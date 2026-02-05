'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Users } from 'lucide-react'
import { TeamSelector } from '@/components/dashboard/team-selector'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TeamMember {
  id: string
  user_id: string
  role: string
  joined_at: string
}

export default function TeamManagementPage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')

  useEffect(() => {
    if (!selectedTeam) return

    const fetchMembers = async () => {
      setLoading(true)
      try {
        // In a real app, you'd fetch team members from an API
        // For now, this is a placeholder
        setMembers([])
      } catch (error) {
        console.error('Error fetching members:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [selectedTeam])

  const handleAddMember = async () => {
    if (!memberEmail.trim() || !selectedTeam) return

    try {
      // In a real implementation, this would send an invitation email
      // For now, just show the form
      setMembers([
        ...members,
        {
          id: Math.random().toString(),
          user_id: memberEmail,
          role: 'member',
          joined_at: new Date().toISOString(),
        },
      ])
      setMemberEmail('')
    } catch (error) {
      console.error('Error adding member:', error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage team members and their roles
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Invite a new member to your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Member email"
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
              />
              <Button
                onClick={handleAddMember}
                disabled={!memberEmail.trim()}
                className="w-full"
              >
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Select Team</h2>
        <TeamSelector
          selectedTeam={selectedTeam}
          onTeamSelect={setSelectedTeam}
        />
      </div>

      {selectedTeam && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Team Members</span>
            </CardTitle>
            <CardDescription>
              {members.length} member{members.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {members.length > 0 ? (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{member.user_id}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined{' '}
                        {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Select defaultValue={member.role}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No team members yet
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedTeam && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Please select a team to manage members
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
