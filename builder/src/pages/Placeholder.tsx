export function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center text-sm text-muted-foreground">
      {title} — coming in a later phase.
    </div>
  )
}
