'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Bell, Lock, User, Github, ExternalLink, Heart, CheckCircle, Loader2, MessageSquare, Star, Send } from 'lucide-react'
import { signOut } from '@/app/auth/actions'
import { toast } from 'sonner'
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';

export default function SettingsPage() {
  const [githubToken, setGithubToken] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [githubUsername, setGithubUsername] = useState('')
  // Feedback state
  const [feedbackCategory, setFeedbackCategory] = useState('suggestion')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackHover, setFeedbackHover] = useState(0)
  const [feedbackSending, setFeedbackSending] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)

  // Check if already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/session/github')
        const data = await response.json()
        setIsConnected(data.hasToken)
      } catch (error) {
        console.error('Failed to check GitHub connection:', error)
      }
    }
    checkConnection()
  }, [])

  const handleSaveGithubToken = async () => {
    if (!githubToken.trim()) {
      toast.error('Please enter a GitHub token')
      return
    }
    setIsSaving(true)

    try {
      const response = await fetch('/api/session/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: githubToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save token')
      }

      toast.success(`GitHub connected as @${data.username}!`)
      setGithubToken('')
      setIsConnected(true)
      setGithubUsername(data.username)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save token')
    }
    setIsSaving(false)
  }

  return (
    <PageShell>
      <PageHeader
        title="Settings"
        description="Manage your account and integrations"
        icon={Settings}
      />

      <div className="grid gap-6 max-w-4xl mx-auto w-full">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-muted-foreground">
                  Managed through Supabase Auth
                </p>
              </div>
              <Button variant="outline">Edit Profile</Button>
            </div>
          </CardContent>
        </Card>

        {/* GitHub Integration Card */}
        <Card className={isConnected ? "border-green-500/50" : "border-yellow-500/50"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Github className="w-5 h-5" />
                <div>
                  <CardTitle>GitHub Integration</CardTitle>
                  <CardDescription>Connect your GitHub for analytics and code review</CardDescription>
                </div>
              </div>
              {isConnected && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected ? (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Your GitHub account is connected. You can view your analytics in the{' '}
                  <a href="/dashboard/github" className="text-primary hover:underline">
                    GitHub Dashboard
                  </a>.
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="github-token">
                {isConnected ? 'Update Personal Access Token' : 'Personal Access Token'}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="github-token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveGithubToken} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Generate a token at{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  GitHub Settings <ExternalLink className="h-3 w-3" />
                </a>
                {' '}with <code className="text-xs bg-muted px-1 rounded">repo</code> and <code className="text-xs bg-muted px-1 rounded">read:user</code> scopes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage alert preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-xs text-muted-foreground">Receive learning reminders</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Critical Alerts Only</Label>
                  <p className="text-xs text-muted-foreground">Only important notifications</p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and sessions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Change Password</Button>
          </CardContent>
        </Card>

        {/* Feedback Form Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Send us Feedback</CardTitle>
                <CardDescription>Suggestions, compliments, bug reports — we read everything!</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {feedbackSent ? (
              <div className="text-center py-8 space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-green-600">Thank you for your feedback! 🎉</h3>
                <p className="text-sm text-muted-foreground">We&apos;ll review your message and get back to you if needed.</p>
                <Button variant="outline" size="sm" onClick={() => { setFeedbackSent(false); setFeedbackMessage(''); setFeedbackRating(0); }}>
                  Send Another
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'suggestion', label: '💡 Suggestion', color: 'bg-blue-500/10 border-blue-500/30 text-blue-600 hover:bg-blue-500/20' },
                      { value: 'compliment', label: '❤️ Compliment', color: 'bg-pink-500/10 border-pink-500/30 text-pink-600 hover:bg-pink-500/20' },
                      { value: 'bug', label: '🐛 Bug Report', color: 'bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20' },
                      { value: 'feature', label: '✨ Feature Request', color: 'bg-purple-500/10 border-purple-500/30 text-purple-600 hover:bg-purple-500/20' },
                      { value: 'other', label: '📝 Other', color: 'bg-gray-500/10 border-gray-500/30 text-gray-600 hover:bg-gray-500/20' },
                    ].map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setFeedbackCategory(cat.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${feedbackCategory === cat.value
                          ? `${cat.color} ring-2 ring-offset-1 ring-primary/30 scale-105`
                          : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                          }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Star Rating */}
                <div className="space-y-2">
                  <Label>How&apos;s your experience? (optional)</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        onMouseEnter={() => setFeedbackHover(star)}
                        onMouseLeave={() => setFeedbackHover(0)}
                        className="p-0.5 transition-transform duration-150 hover:scale-125"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors duration-150 ${star <= (feedbackHover || feedbackRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-muted-foreground/30'
                            }`}
                        />
                      </button>
                    ))}
                    {feedbackRating > 0 && (
                      <span className="text-xs text-muted-foreground ml-2 self-center">
                        {['', 'Needs Work', 'Could be Better', 'Good', 'Great', 'Amazing!'][feedbackRating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="feedback-msg">Your Message</Label>
                  <Textarea
                    id="feedback-msg"
                    placeholder="Tell us what you think... What do you love? What can we improve?"
                    value={feedbackMessage}
                    onChange={e => setFeedbackMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Send Button */}
                <Button
                  className="w-full"
                  disabled={!feedbackMessage.trim() || feedbackSending}
                  onClick={async () => {
                    setFeedbackSending(true);
                    try {
                      // 1. Send to Web3Forms directly from the client
                      const formData = new FormData();
                      formData.append('access_key', 'f119865c-01dd-43f0-bcc6-6e5439c7f000');
                      formData.append('subject', 'Ganapathi AI Feedback Form Submission');
                      formData.append('category', feedbackCategory);
                      formData.append('rating', feedbackRating ? `${feedbackRating} Stars` : 'Not rated');
                      formData.append('message', feedbackMessage);

                      // Using the HTML form submission method as requested, but via JS fetch
                      await fetch('https://api.web3forms.com/submit', {
                        method: 'POST',
                        body: formData
                      });

                      // Removed database save as requested to prevent errors
                      // Only using Web3Forms for feedback submission

                      setFeedbackSent(true);
                      toast.success('Feedback sent successfully! Thank you for submitting. 💜');
                    } catch (e: any) {
                      toast.error(e.message || 'Failed to send feedback');
                    } finally {
                      setFeedbackSending(false);
                    }
                  }}
                >
                  {feedbackSending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" /> Send Feedback</>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={async () => {
                await signOut()
              }}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer Branding */}
      <div className="pt-8 border-t text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-1">
          Built with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> by{' '}
          <span className="font-semibold text-foreground">G R Harsha</span>
        </p>
        <p className="mt-1">Ganapathi Mentor AI © {new Date().getFullYear()}</p>
      </div>
    </PageShell>
  )
}
