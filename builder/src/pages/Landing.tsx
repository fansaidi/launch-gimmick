import { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowRight, Camera, Share2, Sparkles, Workflow } from 'lucide-react'

import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: Camera,
    title: 'Camera & gesture triggers',
    description: 'Kick off an experience when a viewer smiles, taps a button, or hits whatever cue you design.',
  },
  {
    icon: Workflow,
    title: 'Build visually',
    description: 'Drag steps onto a canvas and wire them together — no code, just a flow that matches how the moment should play out.',
  },
  {
    icon: Share2,
    title: 'Publish in one click',
    description: 'Preview on your own device, then publish a link attendees can open on any phone at your event.',
  },
]

export function Landing() {
  const status = useAuthStore((s) => s.status)
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  if (status === 'signed-in') return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <span className="text-sm font-semibold">Launchpad</span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/login">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-center px-4 pb-24 pt-16 text-center sm:pt-24">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Interactive experiences your event guests trigger themselves
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Build camera and gesture-triggered moments — smile to unlock a reveal, tap to start a video — and publish
          them as a link anyone can open on their phone.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/login">
              Get started
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>

        <div className="mt-20 grid w-full gap-6 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-left sm:items-start">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Icon className="size-4.5" />
              </div>
              <h2 className="text-sm font-medium">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
