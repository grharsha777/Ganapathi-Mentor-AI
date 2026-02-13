'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Users, Brain, Activity, Bot } from 'lucide-react'
import { TeamSelector } from '@/components/dashboard/team-selector'
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { GridContainer } from '@/components/layout/GridContainer';
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

  // Placeholder analytics data
  const [analytics, setAnalytics] = useState({
    totalQuestions: 120,
    topTopics: ['React', 'Supabase', 'Typescript'],
    activeUsers: 5
  })

  useEffect(() => {
    if (!selectedTeam) return

    const fetchData = async () => {
      setLoading(true)
      try {
        setMembers([])

        // Fetch Real Analytics
        const analyticsRes = await fetch(`/api/team/analytics?teamId=${selectedTeam}`);
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedTeam])

  const handleAddMember = async () => {
    if (!memberEmail.trim() || !selectedTeam) return

    try {
      const res = await fetch('/api/teams/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeam,
          email: memberEmail
        })
      });

      if (res.ok) {
        const newMember = await res.json();
        setMembers([...members, newMember])
        setMemberEmail('')
      }
    } catch (error) {
      console.error('Error adding member:', error)
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Team Analytics & Management"
        description="Manage team members and view learning insights"
        icon={Users}
        actions={
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
        }
      />

      <Section title="Select Team">
        <TeamSelector
          selectedTeam={selectedTeam}
          onTeamSelect={setSelectedTeam}
        />
      </Section>

      {selectedTeam && (
        <>
          <Section title="Team Analytics">
            <GridContainer cols={3}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total AI Questions</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalQuestions}</div>
                  <p className="text-xs text-muted-foreground">+10% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">Team members active this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Topics</CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analytics.topTopics.map(t => (
                      <span key={t} className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </GridContainer>
          </Section>

          <Section title="Members" description={`${members.length} member${members.length !== 1 ? 's' : ''}`}>
            <Card>
              <CardContent className="pt-6">
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
          </Section>
        </>
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
    </PageShell>
  )
}
