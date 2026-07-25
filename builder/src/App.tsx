import { Routes, Route } from 'react-router-dom'

import { TopNav } from '@/components/layout/TopNav'
import { Dashboard } from '@/pages/Dashboard'
import { FlowBuilder } from '@/pages/FlowBuilder'
import { Placeholder } from '@/pages/Placeholder'

function App() {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <TopNav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/flows/:flowId" element={<FlowBuilder />} />
        <Route path="/assets" element={<Placeholder title="Assets" />} />
        <Route path="/integrations" element={<Placeholder title="Integrations" />} />
      </Routes>
    </div>
  )
}

export default App
