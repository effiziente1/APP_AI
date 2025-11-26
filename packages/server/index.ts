import express from 'express'
import dotenv from 'dotenv'
import OpenAI from 'openai'
import z from 'zod'
import router from './routes'
import { chatController } from './controllers/chat.controller'

dotenv.config()

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const app = express()
app.use(express.json())
app.use(router)
const port = process.env.PORT || 3000

const chatSchema = z.object({
    prompt: z.string()
        .min(1, 'Prompt is required')
        .max(1000, 'Prompt is too long (max 1000 characters)'),
    conversationId: z.uuid()
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})

