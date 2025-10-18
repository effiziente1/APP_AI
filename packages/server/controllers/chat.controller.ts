import type { Request, Response } from "express"
import { conversationRepository } from "../repositories/conversation"
import { chatService } from "../services/chat.service"
import z from "zod"

const chatSchema = z.object({
    prompt: z.string()
        .min(1, 'Prompt is required')
        .max(1000, 'Prompt is too long (max 1000 characters)'),
    conversationId: z.uuid()
})

export const chatController = {
    async sendMessaage(req: Request, res: Response) {
        const parseResult = chatSchema.safeParse(req.body)

        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.issues })
        }
        try {
            const { prompt, conversationId } = parseResult.data
            const response = await chatService.sendMessage(prompt, conversationId)
            res.json({ message: response.message })
        } catch (error) {
            console.error('OpenAI API error:', error)
            res.status(500).json({ error: 'Failed to process chat request' })
        }
    }
}