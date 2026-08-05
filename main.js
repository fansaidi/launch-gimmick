import './style.css'
import { FlowEngine } from './src/js/flow/FlowEngine.js'
import { stepRegistry } from './src/js/flow/stepRegistry.js'
import * as triggerFaceExpression from './src/js/flow/steps/triggerFaceExpression.js'
import * as triggerButton from './src/js/flow/steps/triggerButton.js'
import * as mediaVideo from './src/js/flow/steps/mediaVideo.js'
import * as mediaEmbed from './src/js/flow/steps/mediaEmbed.js'
import { flows } from './src/js/flows/index.js'
import { fetchFlow } from './src/js/services/supabaseClient.js'

stepRegistry.register('trigger.faceExpression', triggerFaceExpression)
stepRegistry.register('trigger.button', triggerButton)
stepRegistry.register('media.video', mediaVideo)
stepRegistry.register('media.embed', mediaEmbed)

const container = document.getElementById('app')

function showUnavailable() {
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#fff;font-family:sans-serif;text-align:center;padding:2rem;">
      This experience isn't available.
    </div>
  `
}

async function resolveFlow(flowParam) {
  // Named demo flows (default, eventLaunch) take priority so the bundled
  // examples keep working; anything else is treated as a real flow id
  // saved through the builder.
  if (!flowParam) return flows.default
  if (flows[flowParam]) return flows[flowParam]
  return fetchFlow(flowParam)
}

async function bootstrap() {
  const flowParam = new URLSearchParams(window.location.search).get('flow')
  const flow = await resolveFlow(flowParam)

  if (!flow) {
    showUnavailable()
    return
  }

  const engine = new FlowEngine(flow, container, { stepRegistry })
  engine.start()
}

bootstrap()
