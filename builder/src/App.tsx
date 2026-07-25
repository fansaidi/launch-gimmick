import { Routes, Route } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { FlowBuilder } from '@/pages/FlowBuilder'
import { Login } from '@/pages/Login'
import { Placeholder } from '@/pages/Placeholder'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/flows/:flowId" element={<FlowBuilder />} />
        <Route path="/assets" element={<Placeholder title="Assets" />} />
        <Route path="/integrations" element={<Placeholder title="Integrations" />} />
      </Route>
    </Routes>
  )
}

export default App
