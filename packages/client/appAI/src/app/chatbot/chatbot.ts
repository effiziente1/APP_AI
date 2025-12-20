import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideAlertCircle, lucideX, lucideLoader2 } from '@ng-icons/lucide';
import { Services } from '../utils/services';
import { lastValueFrom } from 'rxjs';
import { Message } from '../message/message';
import { MarkdownModule } from 'ngx-markdown';
import { MessagesComponent } from '../messages/messages';
import { ChatInputComponent } from '../chat-input/chat-input';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

type ChatResponse = {
    message: string;
}

@Component({
    selector: 'app-chatbot',
    imports: [
        Message,
        MarkdownModule,
        MessagesComponent,
        ChatInputComponent
    ],
    providers: [
        provideIcons({ lucideAlertCircle, lucideX, lucideLoader2 }),
    ],
    templateUrl: './chatbot.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chatbot {
    private readonly services = inject(Services);
    // Chat messages
    messages = signal<ChatMessage[]>([]);
    // Generate once and persist
    private readonly conversationId = signal(crypto.randomUUID());
    // Error handling
    errorMessage = signal<string | null>(null);
    // Loading state
    isLoading = signal(false);

    // Computed signal that aggregates API errors
    allErrors = signal<string[]>([]);

    async handleSendMessage(userPrompt: string) {
        this.messages.update(msgs => [...msgs, { role: 'user', content: userPrompt }]);
        // Clear any previous errors
        this.errorMessage.set(null);
        this.allErrors.set([]);

        const payload = {
            conversationId: this.conversationId(),
            prompt: userPrompt,
        };

        // Set loading state
        this.isLoading.set(true);

        try {
            const response = await lastValueFrom(this.services.post<ChatResponse>('chat', payload));
            this.messages.update(msgs => [...msgs, { role: 'assistant', content: response.message }]);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
            this.errorMessage.set(errorMsg);
            this.allErrors.set([errorMsg]);
        } finally {
            this.isLoading.set(false);
        }
    }
    clearErrors() {
        this.errorMessage.set(null);
        this.allErrors.set([]);
    }
}
