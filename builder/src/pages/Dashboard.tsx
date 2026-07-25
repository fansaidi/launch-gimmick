import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

import { sampleFlows } from '@/data/sample-flows'
import { getComponentMeta } from '@/lib/component-manifest'
import { getComponentIcon } from '@/lib/component-icons'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Your Flows</h1>
          <p className="text-sm text-muted-foreground">Gimmicks you've built, ready to customize or publish.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/flows/new"
          className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="size-5" />
          <span className="text-sm font-medium">New Flow</span>
        </Link>

        {sampleFlows.map((flow) => (
          <Link key={flow.id} to={`/flows/${flow.id}`}>
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {flow.name}
                  <Badge variant="secondary">{flow.steps.length} steps</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {flow.steps.map((step) => {
                    const meta = getComponentMeta(step.type)
                    const Icon = getComponentIcon(step.type)
                    return (
                      <div
                        key={step.id}
                        title={meta?.label}
                        className="flex size-8 items-center justify-center rounded-md bg-accent text-accent-foreground"
                      >
                        <Icon className="size-4" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
