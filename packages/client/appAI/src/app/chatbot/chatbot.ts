import { Component, signal, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmButton } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { lucideArrowUp, lucideAlertCircle, lucideX } from '@ng-icons/lucide';
import { form, Field, required, minLength, maxLength, validate } from '@angular/forms/signals'
import { Services } from '../utils/services';
import { lastValueFrom } from 'rxjs';
import { HlmAlert, HlmAlertDescription, HlmAlertIcon, HlmAlertTitle } from '@spartan-ng/helm/alert';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

@Component({
    selector: 'app-chatbot',
    imports: [
        HlmTextareaImports,
        HlmButton,
        Field,
        NgIcon,
        HlmIcon,
        HlmAlert,
        HlmAlertTitle,
        HlmAlertDescription,
        HlmAlertIcon
    ],
    providers: [
        provideIcons({ lucideArrowUp, lucideAlertCircle, lucideX }),
    ],
    templateUrl: './chatbot.html',
    styleUrl: './chatbot.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chatbot {
    private readonly services = inject(Services);

    // Generate once and persist
    private readonly conversationId = signal(crypto.randomUUID());

    // Chat messages
    messages = signal<ChatMessage[]>([]);

    // Error handling
    errorMessage = signal<string | null>(null);

    // Loading state
    isLoading = signal(false);

    chatModel = signal({
        prompt: '',
    })

    promptForm = form(this.chatModel, (fieldPath) => {
        // Core validators
        required(fieldPath.prompt, { message: 'Prompt is required' });
        minLength(fieldPath.prompt, 1, { message: 'Prompt must be at least 1 characters' });
        maxLength(fieldPath.prompt, 1000, { message: 'Prompt cannot exceed 1000 characters' });

        // Custom whitespace-only validator with unique kind
        validate(fieldPath.prompt, ({ value }) => {
            if (value().trim().length === 0) {
                return {
                    kind: 'whitespace',
                    message: 'Prompt cannot be empty or whitespace only',
                }
            }
            return null
        })
    })

    // Computed signal that aggregates ALL validation and API errors
    // Validation errors are only exposed once the field is dirty
    allErrors = computed<string[] | null>(() => {
        const messages: string[] = [];

        const field = this.promptForm.prompt();

        // Collect validation error messages only after user interaction (dirty)
        if (field.touched() && field.invalid()) {
            const validationMessages = field
                .errors()
                .map(e => e.message)
                .filter((m): m is string => typeof m === 'string' && m.length > 0);

            messages.push(...validationMessages);
        }

        // Collect API error, if any
        const apiError = this.errorMessage();
        if (apiError) {
            messages.push(apiError);
        }

        return messages.length > 0 ? messages : null;
    });

    async sendMessage() {
        if (this.promptForm().valid()) {
            const userPrompt = this.chatModel().prompt;

            // Clear any previous errors
            this.errorMessage.set(null);

            const payload = {
                conversationId: this.conversationId(),
                prompt: userPrompt,
            };

            // Reset form immediately
            this.promptForm.prompt().value.set('');
            this.promptForm.prompt().reset();

            // Set loading state
            this.isLoading.set(true);

            try {
                const response = await lastValueFrom(this.services.post<{ response: string }>('chat', payload));
                console.log('API Response:', response);
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
                this.errorMessage.set(errorMsg);
            } finally {
                this.isLoading.set(false);
            }
        }
    }

    dismissError() {
        this.errorMessage.set(null);
    }
}
