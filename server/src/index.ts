import 'dotenv/config'
import cors from 'cors'
import express from 'express'

import { requireAuth } from './auth.js'
import { flowsRouter } from './routes/flows.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/flows', requireAuth, flowsRouter)

const port = Number(process.env.PORT) || 3001
app.listen(port, () => {
  console.log(`server listening on :${port}`)
})
