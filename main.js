import './style.css'
import { FlowEngine } from './src/js/flow/FlowEngine.js'
import { stepRegistry } from './src/js/flow/stepRegistry.js'
import * as triggerSmile from './src/js/flow/steps/triggerSmile.js'
import * as triggerButton from './src/js/flow/steps/triggerButton.js'
import * as mediaVideo from './src/js/flow/steps/mediaVideo.js'
import { flows } from './src/js/flows/index.js'

stepRegistry.register('trigger.smile', triggerSmile)
stepRegistry.register('trigger.button', triggerButton)
stepRegistry.register('media.video', mediaVideo)

// ?flow=eventLaunch to preview an alternate arrangement of the same steps.
const flowId = new URLSearchParams(window.location.search).get('flow') || 'default'
const flow = flows[flowId] ?? flows.default

const container = document.getElementById('app')
const engine = new FlowEngine(flow, container, { stepRegistry })
engine.start()
