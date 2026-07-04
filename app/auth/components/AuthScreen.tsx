'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Mail, Loader2, ArrowRight, Github } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AuthScreenProps {
  defaultMode?: 'login' | 'signup'
}

export default function AuthScreen({ defaultMode = 'login' }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, signup } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Prefetch the dashboard so transition is instant
    router.prefetch('/dashboard')
  }, [router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (mode === 'signup') {
        if (password !== repeatPassword) {
          setError('Passwords do not match')
          setIsLoading(false)
          return
        }
        await signup(email, password, fullName)
      } else {
        await login(email, password)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  const handleOAuth = (provider: 'google' | 'github') => {
    window.location.href = `/api/auth/oauth?provider=${provider}`
  }

  const toggleMode = (newMode: 'login' | 'signup') => {
    // If we want the URL to actually change without reloading, we can use router.replace
    // But since this component is embedded, just toggling state is smoothest.
    setMode(newMode)
    setError(null)
    router.replace(newMode === 'login' ? '/auth/login' : '/auth/sign-up', { scroll: false })
  }

  // Animation variants spanning full width so layout shifts smoothly
  const variants = {
    initial: { opacity: 0, height: 0, y: 10 },
    animate: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, y: -10, transition: { duration: 0.2 } }
  }

  return (
    <div className="min-h-svh flex flex-col lg:flex-row bg-background">
      {/* LEFT SIDE: Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex relative w-1/2 flex-col justify-between overflow-hidden bg-zinc-950">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 object-cover w-full h-full opacity-60 mix-blend-screen"
        >
          <source src="https://cdn.pixabay.com/vimeo/328238478/technology-23136.mp4?width=1920&hash=0ba3f1ad63ff9e3b97da05e4d2b270a649fbde2b" type="video/mp4" />
        </video>
        
        {/* Abstract dark gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/80 via-transparent to-primary/20 backdrop-blur-[2px]" />

        <div className="relative z-10 p-12 text-zinc-100 flex-1 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 backdrop-blur-md">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className="font-bold text-3xl tracking-tight hidden lg:block">Ganapathi Mentor AI</span>
            </div>
            
            <h1 className="text-5xl font-extrabold tracking-tight mb-6 max-w-lg leading-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">
              Transform Your Coding Workflow.
            </h1>
            <p className="text-lg text-zinc-400 max-w-md mb-12">
              Experience the next generation of AI-assisted development. Secure, fast, and remarkably intelligent.
            </p>
          </motion.div>

          {/* Isometric App Mockup Graphic */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-[120%] pr-12 group perspective-1000"
          >
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800/50 shadow-2xl bg-zinc-950/50 backdrop-blur-3xl transition-transform duration-700 ease-out group-hover:scale-[1.02]">
              <img 
                src="https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=2688&auto=format&fit=crop" 
                alt="App Interface" 
                className="w-full h-auto opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-[400px]">
          
          <div className="flex items-center gap-3 mb-8 lg:hidden">
             <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
             <span className="font-bold text-2xl tracking-tight">Ganapathi Mentor AI</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === 'login' ? 'Sign in to your account' : 'Enter your details to get started'}
            </p>
          </div>

          <div className="mt-8">
            {/* The Google Button is deliberately outside of the sliding forms so it never moves! */}
            <div className="grid gap-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 font-medium bg-background hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 transition-colors"
                onClick={() => handleOAuth('google')}
                disabled={isLoading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="mr-2 h-5 w-5" />
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 font-medium bg-background hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 transition-colors"
                onClick={() => handleOAuth('github')}
                disabled={isLoading}
              >
                <Github className="mr-2 h-5 w-5" />
                Continue with GitHub
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-2 text-xs font-medium uppercase text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Form Container with animated elements inside */}
            <form onSubmit={handleAuth} className="space-y-4">
              
              <AnimatePresence mode="popLayout" initial={false}>
                {mode === 'signup' && (
                  <motion.div
                    key="field-fullName"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-2 overflow-hidden"
                  >
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-11 bg-muted/40"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2 relative z-10">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-muted/40"
                  />
                </div>
              </div>

              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === 'login' && (
                     <Link href="#" className="text-xs font-semibold text-primary hover:underline">
                       Forgot password?
                     </Link>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-muted/40"
                />
              </div>

              <AnimatePresence mode="popLayout" initial={false}>
                {mode === 'signup' && (
                  <motion.div
                    key="field-repeatPassword"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-2 overflow-hidden"
                  >
                    <Label htmlFor="repeat-password">Repeat Password</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="h-11 bg-muted/40"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-2">
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    {error}
                  </div>
                )}
                
                <Button type="submit" className="w-full h-11 text-base font-semibold group flex justify-between px-6" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center mx-auto">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign in' : 'Create account'}</span>
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>

            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-muted-foreground pt-4 block">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => toggleMode(mode === 'login' ? 'signup' : 'login')}
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  {mode === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </span>
            </div>

          </div>
          
          <div className="mt-auto pt-16 xl:pt-32">
             <p className="text-center text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
               By continuing, you agree to our{' '}
               <Link href="/terms" className="underline hover:text-foreground transition-colors">Terms of Service</Link>{' '}
               and{' '}
               <Link href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</Link>.
             </p>
          </div>

        </div>
      </div>
    </div>
  )
}
