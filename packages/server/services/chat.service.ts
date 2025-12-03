import OpenAI from "openai"
import { conversationRepository } from "../repositories/conversation"

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

type ChatResponse = {
    id: string
    message: string
}

export const chatService = {
    async sendMessage(prompt: string, conversationId: string): Promise<ChatResponse> {
        const response = await client.responses.create({
            model: 'gpt-3.5-turbo',
            input: prompt,
            temperature: 0.2,
            max_output_tokens: 200,
            previous_response_id: conversationRepository.getLastResponseId(conversationId)
        })
        conversationRepository.setLastResponseId(conversationId, response.id)
        return { id: response.id, message: response.output_text }
    }

}