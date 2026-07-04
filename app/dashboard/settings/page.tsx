'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Settings, Lock, User, Github, ExternalLink, Heart, CheckCircle, 
  Loader2, Star, Send, Key, Cpu, Shield, Sparkles, Image as ImageIcon, Video, Newspaper,
  Lightbulb, Bug, Wand2, MessageSquare
} from 'lucide-react'
import { signOut } from '@/app/auth/actions'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const API_PROVIDERS = [
  { id: 'claude', name: 'Anthropic Claude', icon: Cpu, prefix: 'sk-ant-', url: 'https://console.anthropic.com/settings/keys' },
  { id: 'openai', name: 'OpenAI', icon: Cpu, prefix: 'sk-', url: 'https://platform.openai.com/api-keys' },
  { id: 'grok', name: 'xAI Grok', icon: Cpu, prefix: 'xai-', url: 'https://console.x.ai/' },
  { id: 'groq', name: 'Groq', icon: Cpu, prefix: 'gsk_', url: 'https://console.groq.com/keys' },
  { id: 'mistral', name: 'Mistral AI', icon: Cpu, prefix: '', url: 'https://console.mistral.ai/api-keys/' },
  { id: 'openrouter', name: 'OpenRouter', icon: Cpu, prefix: 'sk-or-', url: 'https://openrouter.ai/keys' },
  { id: 'ollama', name: 'Ollama (Local URL)', icon: Cpu, prefix: 'http', url: 'https://ollama.com/' },
  { id: 'image', name: 'Image Gen API', icon: ImageIcon, prefix: '', url: 'https://platform.openai.com/docs/api-reference/images' },
  { id: 'video', name: 'Video Gen API', icon: Video, prefix: '', url: 'https://docs.runwayml.com/' },
  { id: 'news', name: 'News API', icon: Newspaper, prefix: '', url: 'https://newsapi.org/' },
]

export default function SettingsPage() {
  const { data: meRes, mutate } = useSWR('/api/auth/me', fetcher)
  
  // Profile State
  const [profileName, setProfileName] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // API Keys state
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  
  // GitHub state
  const [githubToken, setGithubToken] = useState('')
  const [isSavingGithub, setIsSavingGithub] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  
  // Feedback state
  const [feedbackCategory, setFeedbackCategory] = useState('suggestion')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackHover, setFeedbackHover] = useState(0)
  const [feedbackSending, setFeedbackSending] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)

  // Load data
  useEffect(() => {
    if (meRes?.user?.full_name) {
      setProfileName(meRes.user.full_name)
    }

    try {
      const savedKeys = localStorage.getItem('gm_local_api_keys')
      if (savedKeys) setApiKeys(JSON.parse(savedKeys))
    } catch(e) {}

    fetch('/api/session/github').then(res => res.json()).then(data => {
      setIsConnected(data.hasToken)
    }).catch(() => {})
  }, [meRes])

  const handleUpdateProfile = async () => {
    if (!profileName.trim()) return toast.error('Name cannot be empty')
    setIsSavingProfile(true)
    try {
      const res = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: profileName })
      })
      if (!res.ok) throw new Error('Failed to update profile')
      toast.success('Profile updated successfully!')
      setIsEditingProfile(false)
      mutate() 
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSaveGithubToken = async () => {
    if (!githubToken.trim()) return toast.error('Please enter a GitHub token')
    setIsSavingGithub(true)
    try {
      const response = await fetch('/api/session/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: githubToken }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to save token')
      toast.success(`GitHub connected as @${data.username}!`)
      setGithubToken('')
      setIsConnected(true)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save token')
    }
    setIsSavingGithub(false)
  }

  const handleSaveApiKey = (id: string, value: string) => {
    const newKeys = { ...apiKeys, [id]: value }
    setApiKeys(newKeys)
    try {
      localStorage.setItem('gm_local_api_keys', JSON.stringify(newKeys))
      toast.success(`${API_PROVIDERS.find(p => p.id === id)?.name} key saved locally!`)
    } catch(e) {
      toast.error('Failed to save to local storage')
    }
  }

  const handleDeleteApiKey = (id: string) => {
    const newKeys = { ...apiKeys }
    delete newKeys[id]
    setApiKeys(newKeys)
    try {
      localStorage.setItem('gm_local_api_keys', JSON.stringify(newKeys))
      toast.info('API key removed')
    } catch(e) {}
  }

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const activeAiKeysCount = API_PROVIDERS.filter(p => ['claude','openai','grok','groq','mistral','openrouter','ollama'].includes(p.id) && !!apiKeys[p.id]).length;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 space-y-12 animate-in fade-in duration-700 pb-24">
      
      {/* ═════════ HEADER ═════════ */}
      <div className="w-full flex items-center gap-5 border-b border-white/10 pb-8">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/20 border border-white/10">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">System Preferences</h1>
          <p className="text-gray-400 text-lg mt-1">Manage global configuration, local API keys, and workspace integrations.</p>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* ═════════ LEFT COLUMN (Main config) ═════════ */}
        <div className="xl:col-span-7 space-y-8 select-none">
          
          {/* PROFILE CARD */}
          <Card className="bg-gradient-to-b from-white/[0.04] to-transparent border-white/10 overflow-hidden shadow-2xl relative rounded-3xl min-h-[250px]">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20"><User className="w-6 h-6 text-cyan-400" /></div>
                <div>
                  <CardTitle className="text-2xl font-black">User Identity</CardTitle>
                  <CardDescription className="text-gray-400">Personal details and authentication.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {meRes === undefined ? (
                <div className="space-y-4 animate-pulse"><div className="h-16 bg-white/5 rounded-2xl"/><div className="h-16 bg-white/5 rounded-2xl"/></div>
              ) : (
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-black/30 p-6 rounded-2xl border border-white/5">
                  <Avatar className="w-28 h-28 border-4 border-white/5 shadow-2xl shadow-cyan-500/10">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-900 to-blue-900 text-cyan-400 text-4xl font-black">
                      {meRes.user?.full_name?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-6 w-full">
                    <div className="space-y-1.5">
                      <Label className="text-gray-500 text-xs uppercase tracking-[0.2em] font-bold">Email Address</Label>
                      <p className="text-xl font-medium text-gray-200">{meRes.user?.email || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-500 text-xs uppercase tracking-[0.2em] font-bold">Workspace Name</Label>
                      {isEditingProfile ? (
                        <div className="flex gap-3">
                          <Input 
                            value={profileName} 
                            onChange={(e) => setProfileName(e.target.value)}
                            className="bg-black border-white/20 focus-visible:ring-cyan-500 h-12 text-lg"
                          />
                          <Button onClick={handleUpdateProfile} disabled={isSavingProfile} className="h-12 px-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                            {isSavingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
                          </Button>
                          <Button variant="ghost" onClick={() => setIsEditingProfile(false)} className="h-12 hover:bg-white/5">Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-black/40 px-4 py-3 rounded-xl border border-white/5 ring-1 ring-white/5">
                          <p className="text-xl font-bold text-white">{meRes.user?.full_name || 'N/A'}</p>
                          <Button variant="outline" onClick={() => setIsEditingProfile(true)} className="border-white/10 hover:bg-white/10 hover:text-cyan-400 transition-colors">
                            Edit Name
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GITHUB INTEGRATION */}
          <Card className={`bg-gradient-to-b from-white/[0.04] to-transparent overflow-hidden shadow-2xl relative rounded-3xl min-h-[220px] ${isConnected ? 'border-indigo-500/30' : 'border-white/10'}`}>
            <div className={`absolute top-0 w-full h-1 bg-gradient-to-r ${isConnected ? 'from-indigo-500 to-purple-500' : 'from-gray-500 to-gray-700'}`} />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${isConnected ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-gray-800/50 border-white/10'}`}>
                    <Github className={`w-6 h-6 ${isConnected ? 'text-indigo-400' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black">GitHub Integration</CardTitle>
                    <CardDescription className="text-gray-400">Sync repositories and enable deep analytics.</CardDescription>
                  </div>
                </div>
                {isConnected && (
                  <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-lg shadow-indigo-500/10 px-3 py-1 text-sm font-bold">
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Linked
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="flex md:flex-row flex-col gap-3">
                  <Input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="flex-1 bg-black border-white/10 focus-visible:ring-indigo-500 h-12 text-lg font-mono placeholder:font-sans"
                  />
                  <Button size="lg" onClick={handleSaveGithubToken} disabled={isSavingGithub} className={`h-12 px-8 font-bold text-base ${isConnected ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white text-black hover:bg-gray-200'}`}>
                    {isSavingGithub && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                    {isConnected ? 'Update Sync Token' : 'Authorize GitHub'}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                  A classic token with <code className="bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono text-xs">repo</code> scope is required. 
                  <a href="https://github.com/settings/tokens" target="_blank" className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium inline-flex items-center gap-1 ml-1">Generate here <ExternalLink className="w-3.5 h-3.5"/></a>
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ═════════ RIGHT COLUMN (Feedback & API Keys) ═════════ */}
        <div className="xl:col-span-5 space-y-8 select-none">
          
          {/* FEEDBACK CARD (Matched to User Reference) */}
          <Card className="bg-[#0b0410] border border-[#2a1b38] overflow-hidden shadow-2xl relative rounded-3xl min-h-[350px]">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Send us Feedback</CardTitle>
                  <CardDescription className="text-gray-400 text-sm mt-1">Suggestions, compliments, bug reports — we read everything!</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {feedbackSent ? (
                <div className="text-center py-12 space-y-5">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1c0f2e]">
                    <CheckCircle className="w-10 h-10 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Feedback received!</h3>
                  <Button variant="outline" size="sm" onClick={() => setFeedbackSent(false)} className="mt-4 border-[#2a1b38] hover:bg-[#1c0f2e] text-white">
                    Send more
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 mt-2">
                  {/* Category Pills */}
                  <div className="space-y-3">
                    <Label className="text-sm text-gray-200 font-semibold block">Category</Label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, iconColor: 'text-yellow-400' },
                        { value: 'compliment', label: 'Compliment', icon: Heart, iconColor: 'text-rose-400' },
                        { value: 'bug', label: 'Bug Report', icon: Bug, iconColor: 'text-emerald-400' },
                        { value: 'feature', label: 'Feature Request', icon: Sparkles, iconColor: 'text-amber-400' },
                        { value: 'other', label: 'Other', icon: MessageSquare, iconColor: 'text-gray-400' }
                      ].map(cat => (
                        <button
                          key={cat.value}
                          onClick={() => setFeedbackCategory(cat.value)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${feedbackCategory === cat.value ? 'bg-[#1a1130] border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)] text-blue-400 font-medium' : 'bg-[#150a21] border-[#2a1b38] text-gray-400 hover:text-gray-200 hover:bg-[#1a1130]'}`}
                        >
                          <cat.icon className={`w-4 h-4 ${cat.iconColor} ${feedbackCategory === cat.value ? '' : 'opacity-70'}`} />
                          <span className="text-sm">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm text-gray-200 font-semibold block">How's your experience? (optional)</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                         <button
                           key={star}
                           onClick={() => setFeedbackRating(star)}
                           onMouseEnter={() => setFeedbackHover(star)}
                           onMouseLeave={() => setFeedbackHover(0)}
                           className="transition-transform"
                         >
                           <Star className={`w-7 h-7 ${star <= (feedbackHover || feedbackRating) ? 'text-gray-300 fill-gray-300' : 'text-gray-600'}`} />
                         </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm text-gray-200 font-semibold block">Your Message</Label>
                    <Textarea
                      placeholder="Tell us what you think... What do you love? What can we improve?"
                      value={feedbackMessage}
                      onChange={e => setFeedbackMessage(e.target.value)}
                      rows={5}
                      className="resize-none bg-black border-[#2a1b38] focus-visible:ring-purple-500 text-sm placeholder:text-gray-600 rounded-xl"
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-[#5b2f91] hover:bg-[#6c39ab] text-gray-300 hover:text-white font-medium text-sm h-12 rounded-xl"
                    disabled={!feedbackMessage.trim() || feedbackSending}
                    onClick={async () => {
                      setFeedbackSending(true)
                      try {
                        const formData = new FormData()
                        formData.append('access_key', 'f119865c-01dd-43f0-bcc6-6e5439c7f000') 
                        formData.append('subject', `Ganapathi Feedback: ${feedbackCategory}`)
                        formData.append('rating', `${feedbackRating} Stars`)
                        formData.append('message', feedbackMessage)
                        await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
                        setFeedbackSent(true)
                        toast.success('Transmission successful.')
                      } catch (e) {
                        toast.error('Transmission failed.')
                      } finally {
                        setFeedbackSending(false)
                      }
                    }}
                  >
                    {feedbackSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2 opacity-70" /> Send Feedback</>}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* DANGER ZONE */}
          <Card className="bg-red-950/20 border-red-500/20 overflow-hidden relative rounded-3xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                  <Lock className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-red-500">Danger Zone</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" size="lg" className="w-full bg-red-600/80 hover:bg-red-600 font-bold border border-red-500/50 h-12 text-lg" onClick={() => signOut()}>
                Terminate Session
              </Button>
            </CardContent>
          </Card>

        </div>
        
        {/* ═════════ FULL WIDTH BOTTOM: API KEYS MANAGER ═════════ */}
        <div className="col-span-full border-t border-white/10 pt-12 mt-4 space-y-8 select-none">
          <div className="flex items-start justify-between max-w-4xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <Key className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  Local API Keys Vault
                  {activeAiKeysCount >= 2 && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1 shadow-lg shadow-emerald-500/10"><CheckCircle className="w-4 h-4 mr-1.5"/> Optimal Readiness</Badge>}
                </h2>
                <p className="text-gray-400 text-lg mt-1">
                  Bring your own keys to bypass limits. Stored <strong className="text-emerald-400 font-bold underline decoration-emerald-500/30 underline-offset-4">strictly locally</strong> in your browser cache.
                </p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-black border border-white/10 ring-1 ring-emerald-500/20 shadow-xl shadow-emerald-500/5">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-black uppercase tracking-widest">End-to-End Secure</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white/[0.01] p-6 sm:p-8 rounded-3xl border border-white/5 ring-1 ring-white/5 shadow-2xl">
            {API_PROVIDERS.map((provider) => {
              const hasKey = !!apiKeys[provider.id]
              return (
                <div key={provider.id} className={`p-5 rounded-2xl border-2 transition-all group ${hasKey ? 'border-emerald-500/30 bg-emerald-950/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]' : 'border-white/5 bg-black hover:border-white/20'}`}>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${hasKey ? 'bg-emerald-500/20 text-emerald-400 shadow-inner' : 'bg-white/5 text-gray-400'}`}>
                        <provider.icon className="w-5 h-5" />
                      </div>
                      <span className={`font-black text-lg ${hasKey ? 'text-white' : 'text-gray-300'}`}>{provider.name}</span>
                    </div>
                    {provider.url && provider.url !== '#' && (
                       <a href={provider.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-gray-500 hover:text-emerald-400 flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                         Get API Key <ExternalLink className="w-3 h-3" />
                       </a>
                    )}
                  </div>
                  
                  <div className="flex gap-3 relative">
                    <div className="relative flex-1 group/input">
                      <Input 
                        type={visibleKeys[provider.id] ? "text" : "password"}
                        placeholder={provider.prefix ? `${provider.prefix}...` : 'Paste secure key here...'}
                        value={apiKeys[provider.id] || ''}
                        onChange={(e) => {
                          const v = e.target.value
                          setApiKeys(prev => ({...prev, [provider.id]: v}))
                        }}
                        className={`bg-black h-12 text-base pr-12 transition-colors ${hasKey ? 'text-emerald-400 border-emerald-500/30 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 font-mono tracking-wider' : 'border-white/10 focus-visible:ring-white/30'}`}
                      />
                      {apiKeys[provider.id] && (
                        <button 
                          onClick={() => toggleKeyVisibility(provider.id)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {hasKey ? (
                      <Button variant="destructive" className="h-12 w-24 shrink-0 font-bold bg-red-950 text-red-500 hover:bg-red-900 border border-red-900" onClick={() => handleDeleteApiKey(provider.id)}>
                        Purge
                      </Button>
                    ) : (
                      <Button className="h-12 w-24 shrink-0 font-bold bg-white text-black hover:bg-gray-200 border border-transparent shadow-lg" onClick={() => {
                        if(apiKeys[provider.id]) handleSaveApiKey(provider.id, apiKeys[provider.id])
                      }}>
                        Save Key
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
      
      {/* ═════════ FOOTER ═════════ */}
      <div className="w-full pt-12 mt-12 border-t border-white/5 text-center text-gray-500 select-none pb-10">
        <p className="flex items-center justify-center gap-1.5 font-medium text-lg">
          Crafted with <Heart className="h-5 w-5 text-rose-600 fill-rose-600 drop-shadow-[0_0_8px_rgba(225,29,72,0.5)]" /> by <span className="text-white font-bold ml-1">G R Harsha</span>
        </p>
        <p className="mt-2 text-sm font-bold uppercase tracking-widest opacity-60">Ganapathi AI Hub &copy; {new Date().getFullYear()}</p>
      </div>

    </div>
  )
}
