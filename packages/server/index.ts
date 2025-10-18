import express from 'express'
import type { Request, Response } from 'express'
import dotenv from 'dotenv'
import OpenAI from 'openai'
import z from 'zod'
import { conversationRepository } from './repositories/conversation'
import { chatService } from './services/chat.service'
import { chatController } from './controllers/chat.controller'

dotenv.config()

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const app = express()
app.use(express.json())
const port = process.env.PORT || 3000

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
})

let lastResponseId: string | null = null

const chatSchema = z.object({
    prompt: z.string()
        .min(1, 'Prompt is required')
        .max(1000, 'Prompt is too long (max 1000 characters)'),
    conversationId: z.uuid()
})

app.post('/api/chat', chatController.sendMessaage)

app.get('/api/hello', (req: Request, res: Response) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})

